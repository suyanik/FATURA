import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateInvoicePDF, streamToBuffer } from '@/lib/pdf/invoice-generator'
import { buildInvoicePDFData } from '@/lib/pdf/pdf-data'
import { embedZugferdXml } from '@/lib/zugferd'
import nodemailer from 'nodemailer'

const fmtMoney = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency === 'TRY' ? 'TRY' : currency,
  }).format(amount)
}

const fmtDate = (date: Date): string =>
  new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await context.params
    const body = await request.json()
    const { recipientEmail, subject, message } = body

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse des Empfängers ist erforderlich' },
        { status: 400 }
      )
    }

    // Rechnung mit allen Daten abrufen
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        company: true,
        items: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Rechnung nicht gefunden' },
        { status: 404 }
      )
    }

    // System-Einstellungen abrufen
    const settings = await prisma.invoiceSettings.findFirst()

    if (!settings?.companyEmail) {
      return NextResponse.json(
        {
          error:
            'Firmen-E-Mail-Adresse ist nicht konfiguriert. Bitte gehen Sie zu Einstellungen.',
        },
        { status: 400 }
      )
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        {
          error:
            'SMTP-Zugangsdaten sind nicht konfiguriert (SMTP_USER / SMTP_PASSWORD).',
        },
        { status: 400 }
      )
    }

    // PDF generieren (inkl. ZUGFeRD-XML)
    const pdfData = buildInvoicePDFData(invoice, settings)
    const pdfStream = await generateInvoicePDF(pdfData)
    let pdfBuffer = await streamToBuffer(pdfStream)

    try {
      pdfBuffer = await embedZugferdXml(pdfBuffer, pdfData)
    } catch (e) {
      console.error('ZUGFeRD-Einbettung fehlgeschlagen (PDF ohne XML):', e)
    }

    // E-Mail-Transporter konfigurieren
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const total = parseFloat(invoice.total.toString())
    const emailSubject =
      subject || `Rechnung ${invoice.invoiceNumber} – ${settings.companyName}`

    const textMessage =
      message ||
      `Sehr geehrte Damen und Herren,

anbei erhalten Sie die Rechnung ${invoice.invoiceNumber} vom ${fmtDate(invoice.issueDate)} über ${fmtMoney(total, invoice.currency)}.
${invoice.dueDate ? `\nZahlbar bis: ${fmtDate(invoice.dueDate)}` : ''}
Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
${settings.companyName}
${settings.companyPhone ? `Tel: ${settings.companyPhone}` : ''}
${settings.companyEmail}`

    const htmlMessage = `
<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:0;background:#f6f7f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:#0f172a;padding:20px 32px;">
            <span style="color:#ffffff;font-size:16px;font-weight:bold;">${settings.companyName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${
              message
                ? `<p style="color:#334155;font-size:14px;line-height:1.6;white-space:pre-line;">${message}</p>`
                : `
            <p style="color:#334155;font-size:14px;line-height:1.6;">Sehr geehrte Damen und Herren,</p>
            <p style="color:#334155;font-size:14px;line-height:1.6;">
              anbei erhalten Sie die Rechnung <strong>${invoice.invoiceNumber}</strong>
              vom ${fmtDate(invoice.issueDate)} als PDF-Dokument (inkl. E-Rechnungs-Daten im ZUGFeRD-Format).
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;margin:16px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;color:#64748b;font-size:12px;">Rechnungsbetrag</p>
                  <p style="margin:4px 0 0;color:#0f172a;font-size:22px;font-weight:bold;">${fmtMoney(total, invoice.currency)}</p>
                  ${invoice.dueDate ? `<p style="margin:8px 0 0;color:#64748b;font-size:12px;">Zahlbar bis: <strong style="color:#334155;">${fmtDate(invoice.dueDate)}</strong></p>` : ''}
                </td>
              </tr>
            </table>
            <p style="color:#334155;font-size:14px;line-height:1.6;">
              Bei Fragen stehen wir Ihnen gerne zur Verfügung.
            </p>
            <p style="color:#334155;font-size:14px;line-height:1.6;">
              Mit freundlichen Grüßen<br/>
              <strong>${settings.companyName}</strong>
            </p>`
            }
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e7edf3;">
            <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
              ${settings.companyName} · ${settings.companyAddress}${settings.companyPostalCode || settings.companyCity ? ` · ${[settings.companyPostalCode, settings.companyCity].filter(Boolean).join(' ')}` : ''}<br/>
              Steuernr.: ${settings.companyTaxId}${settings.companyUstIdNr ? ` · USt-IdNr.: ${settings.companyUstIdNr}` : ''}
              ${settings.bankIBAN ? `<br/>IBAN: ${settings.bankIBAN}${settings.bankBIC ? ` · BIC: ${settings.bankBIC}` : ''}` : ''}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    // E-Mail senden
    await transporter.sendMail({
      from: `"${settings.companyName}" <${process.env.SMTP_USER}>`,
      replyTo: settings.companyEmail,
      to: recipientEmail,
      subject: emailSubject,
      text: textMessage,
      html: htmlMessage,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })

    // Status auf "Versendet" setzen, wenn noch Entwurf
    if (invoice.status === 'DRAFT') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'SENT' },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'E-Mail erfolgreich gesendet',
    })
  } catch (error) {
    console.error('E-Mail-Sendefehler:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      {
        error: 'Fehler beim Senden der E-Mail',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
