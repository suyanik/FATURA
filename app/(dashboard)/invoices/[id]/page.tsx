import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/utils'
import { statusLabels, statusColors } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InvoiceStatusChanger } from '@/components/invoices/InvoiceStatusChanger'
import { InvoiceActions } from '@/components/invoices/InvoiceActions'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header mit Zurück-Button */}
      <div className="flex items-center gap-3">
        <Link href="/invoices">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Rechnung</h1>
      </div>

      {/* Rechnungsinfo Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Linke Seite - Rechnungsdetails */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rechnungsnummer</p>
                <p className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rechnungsdatum</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
                {invoice.dueDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fälligkeitsdatum</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                )}
                {invoice.serviceDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Leistungsdatum</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(invoice.serviceDate)}
                    </p>
                  </div>
                )}
                {invoice.servicePeriodStart && invoice.servicePeriodEnd && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Leistungszeitraum</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(invoice.servicePeriodStart)} – {formatDate(invoice.servicePeriodEnd)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kunde</p>
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.company.name}
                  </p>
                </div>
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Zahlungsart</p>
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.paymentMethod}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rechte Seite - Betrag und Status */}
            <div className="text-right space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Gesamtsumme</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(invoice.total.toNumber(), invoice.currency)}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <InvoiceStatusChanger
                  invoiceId={invoice.id}
                  currentStatus={invoice.status}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktionen */}
      <InvoiceActions
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        status={invoice.status}
        companyEmail={invoice.company.email}
      />

      {/* Rechnungsinhalt - Druckbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 print:border-0">
        {/* Kopfzeile */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-3">RECHNUNG</h2>
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="font-medium text-gray-700">Rechnungsnr.:</span>{' '}
                <span className="text-gray-900">{invoice.invoiceNumber}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Rechnungsdatum:</span>{' '}
                <span className="text-gray-900">{formatDate(invoice.issueDate)}</span>
              </p>
              {invoice.dueDate && (
                <p>
                  <span className="font-medium text-gray-700">Fälligkeitsdatum:</span>{' '}
                  <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
                </p>
              )}
              <p>
                <span className="font-medium text-gray-700">Währung:</span>{' '}
                <span className="text-gray-900">{invoice.currency}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Gesamtsumme</p>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(invoice.total.toNumber(), invoice.currency)}
            </div>
          </div>
        </div>

        {/* Kundeninformationen */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Kundeninformationen</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-bold text-base mb-3 text-gray-900">{invoice.company.name}</p>
                <div className="space-y-1 text-gray-600">
                  <p>{invoice.company.address}</p>
                  {invoice.company.city && (
                    <p>
                      {invoice.company.postalCode && `${invoice.company.postalCode} `}
                      {invoice.company.city}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {invoice.company.taxId && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Steuernummer</span>
                    <p className="text-gray-900">{invoice.company.taxId}</p>
                  </div>
                )}
                {invoice.company.ustIdNr && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">USt-IdNr</span>
                    <p className="text-gray-900">{invoice.company.ustIdNr}</p>
                  </div>
                )}
                {invoice.company.taxOffice && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Finanzamt</span>
                    <p className="text-gray-900">{invoice.company.taxOffice}</p>
                  </div>
                )}
                {invoice.company.email && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">E-Mail</span>
                    <p className="text-gray-900">{invoice.company.email}</p>
                  </div>
                )}
                {invoice.company.phone && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Telefon</span>
                    <p className="text-gray-900">{invoice.company.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rechnungspositionen */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Positionen</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Beschreibung</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Menge</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Einheit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Stückpreis</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">MwSt %</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">MwSt-Betrag</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Gesamt</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoice.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index !== invoice.items.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    <td className="py-3 px-4 text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {item.quantity.toNumber()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{item.unit}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {formatCurrency(
                        item.unitPrice.toNumber(),
                        invoice.currency
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {item.vatRate.toNumber()}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {formatCurrency(
                        item.vatAmount.toNumber(),
                        invoice.currency
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(item.total.toNumber(), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summen */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Zwischensumme</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(invoice.subtotal.toNumber(), invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Gesamt MwSt</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(invoice.totalVat.toNumber(), invoice.currency)}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Gesamtsumme</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(invoice.total.toNumber(), invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notizen und Zahlungsbedingungen */}
        {(invoice.notes || invoice.paymentTerms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            {invoice.notes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Notizen</h3>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.paymentTerms && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Zahlungsbedingungen</h3>
                <p className="text-sm text-green-800 whitespace-pre-wrap">
                  {invoice.paymentTerms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fußzeile */}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>
              Erstellt von <span className="font-medium text-gray-700">{invoice.createdBy.name}</span>
            </p>
            <p>
              {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
