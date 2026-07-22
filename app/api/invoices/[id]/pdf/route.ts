import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateInvoicePDF, streamToBuffer } from '@/lib/pdf/invoice-generator'
import { buildInvoicePDFData } from '@/lib/pdf/pdf-data'
import { embedZugferdXml } from '@/lib/zugferd'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await context.params

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

    // System-Einstellungen abrufen (für Absenderinformationen)
    const settings = await prisma.invoiceSettings.findFirst()

    // PDF generieren
    const pdfData = buildInvoicePDFData(invoice, settings)
    const pdfStream = await generateInvoicePDF(pdfData)
    let pdfBuffer = await streamToBuffer(pdfStream)

    // ZUGFeRD/Factur-X XML einbetten (E-Rechnung)
    try {
      pdfBuffer = await embedZugferdXml(pdfBuffer, pdfData)
    } catch (e) {
      console.error('ZUGFeRD-Einbettung fehlgeschlagen (PDF ohne XML):', e)
    }

    // Check for inline parameter
    const url = new URL(request.url)
    const inline = url.searchParams.get('inline') === 'true'

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF-Generierungsfehler:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler bei der PDF-Generierung' },
      { status: 500 }
    )
  }
}
