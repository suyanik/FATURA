'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/currency'
import { getCalendarWeek } from '@/lib/utils'
import { calculateInvoiceItem } from '@/lib/invoice-calculator'

interface Company {
  id: string
  name: string
  taxId: string
}

interface Product {
  id: string
  code: string
  name: string
  defaultPrice: number
  unit: string
  defaultVatRate: number
}

interface InvoiceItem {
  productId?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number | string
  vatRate: number
}



interface Invoice {
  id: string
  invoiceNumber: string
  companyId: string
  issueDate: string
  serviceDate: string | null
  servicePeriodStart: string | null
  servicePeriodEnd: string | null
  dueDate: string | null
  currency: 'TRY' | 'USD' | 'EUR'
  notes: string | null
  paymentTerms: string | null
  paymentMethod: string | null
  status: string
  items: Array<{
    id: string
    productId: string | null
    description: string
    quantity: number
    unit: string
    unitPrice: number
    vatRate: number
  }>
}

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [invoiceId, setInvoiceId] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Data
  const [companies, setCompanies] = useState<Company[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form state
  const [companyId, setCompanyId] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [servicePeriodStart, setServicePeriodStart] = useState('')
  const [servicePeriodEnd, setServicePeriodEnd] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>('EUR')
  const [notes, setNotes] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'PAID'>('DRAFT')

  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    params.then((p) => {
      setInvoiceId(p.id)
      fetchData(p.id)
    })
  }, [])

  const fetchData = async (id: string) => {
    try {
      const [invoiceRes, companiesRes, productsRes] = await Promise.all([
        fetch(`/api/invoices/${id}`),
        fetch('/api/customers'),
        fetch('/api/products?active=true'),
      ])

      if (!invoiceRes.ok) {
        throw new Error('Rechnung nicht gefunden')
      }

      const invoiceData: Invoice = await invoiceRes.json()
      const companiesData = await companiesRes.json()
      const productsData = await productsRes.json()

      // Check if invoice can be edited
      if (invoiceData.status === 'PAID' || invoiceData.status === 'CANCELLED') {
        setError('Bezahlte oder stornierte Rechnungen können nicht bearbeitet werden')
        setLoading(false)
        return
      }

      setInvoice(invoiceData)
      setCompanies(companiesData)
      setProducts(productsData)

      // Set form values
      setCompanyId(invoiceData.companyId)
      setIssueDate(invoiceData.issueDate.split('T')[0])
      setServiceDate(invoiceData.serviceDate ? invoiceData.serviceDate.split('T')[0] : '')
      setServicePeriodStart(invoiceData.servicePeriodStart ? invoiceData.servicePeriodStart.split('T')[0] : '')
      setServicePeriodEnd(invoiceData.servicePeriodEnd ? invoiceData.servicePeriodEnd.split('T')[0] : '')
      setPaymentMethod(invoiceData.paymentMethod || '')
      setDueDate(invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '')
      setCurrency(invoiceData.currency)
      setNotes(invoiceData.notes || '')
      setPaymentTerms(invoiceData.paymentTerms || '')
      setStatus(invoiceData.status as 'DRAFT' | 'SENT' | 'PAID')

      // Set items
      setItems(
        invoiceData.items.map((item) => ({
          productId: item.productId || undefined,
          description: item.description,
          quantity: parseFloat(item.quantity.toString()),
          unit: item.unit,
          unitPrice: parseFloat(item.unitPrice.toString()),
          vatRate: parseFloat(item.vatRate.toString()),
        }))
      )

      setLoading(false)
    } catch (err) {
      setError('Fehler beim Laden der Rechnung')
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: undefined,
        description: '',
        quantity: 1,
        unit: 'Stk',
        unitPrice: 0,
        vatRate: 19,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const selectProduct = (index: number, productId: string) => {
    const newItems = [...items]

    if (!productId) {
      // Manuelle Eingabe seçildi - sadece productId'yi temizle
      newItems[index] = { ...newItems[index], productId: undefined }
    } else {
      const product = products.find((p) => p.id === productId)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: productId,
          description: product.name,
          unit: product.unit,
          unitPrice: product.defaultPrice,
          vatRate: Number(product.defaultVatRate),
        }
      }
    }

    setItems(newItems)
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalVat = 0

    items.forEach((item) => {
      const calc = calculateInvoiceItem(item.quantity, item.unitPrice, item.vatRate)
      subtotal += calc.subtotal
      totalVat += calc.vatAmount
    })

    return {
      subtotal,
      totalVat,
      total: subtotal + totalVat,
    }
  }

  const totals = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const data = {
      companyId,
      issueDate: new Date(issueDate),
      serviceDate: serviceDate ? new Date(serviceDate) : undefined,
      servicePeriodStart: servicePeriodStart ? new Date(servicePeriodStart) : undefined,
      servicePeriodEnd: servicePeriodEnd ? new Date(servicePeriodEnd) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      currency,
      exchangeRate: 1,
      notes: notes || undefined,
      paymentTerms: paymentTerms || undefined,
      paymentMethod: paymentMethod || undefined,
      status,
      items: items.map((item) => ({
        productId: item.productId || undefined,
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        vatRate: Number(item.vatRate),
      })),
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Ein Fehler ist aufgetreten')
        setSaving(false)
        return
      }

      router.push('/invoices')
      router.refresh()
    } catch (err) {
      setError('Verbindungsfehler')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Wird geladen...</p>
      </div>
    )
  }

  if (!invoice || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">{error || 'Rechnung nicht gefunden'}</p>
          <Link href="/invoices">
            <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Zurück zu Rechnungen
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rechnung bearbeiten</h1>
          <p className="mt-2 text-gray-600">{invoice.invoiceNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kunden- und Datumsinformationen */}
        <Card>
          <CardHeader>
            <CardTitle>Rechnungsinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">
                  Kunde <span className="text-primary">*</span>
                </Label>
                <select
                  id="company"
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Kunde auswählen</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-primary">*</span>
                </Label>
                <select
                  id="status"
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'SENT' | 'PAID')}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="DRAFT">Entwurf</option>
                  <option value="SENT">Gesendet</option>
                  <option value="PAID">Bezahlt</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">
                  Rechnungsdatum {issueDate && <span className="text-primary font-medium ml-2 text-sm">(KW {getCalendarWeek(issueDate)})</span>} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="issueDate"
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDate">Leistungsdatum</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicePeriodStart">Leistungszeitraum von</Label>
                <Input
                  id="servicePeriodStart"
                  type="date"
                  value={servicePeriodStart}
                  onChange={(e) => setServicePeriodStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicePeriodEnd">Leistungszeitraum bis</Label>
                <Input
                  id="servicePeriodEnd"
                  type="date"
                  value={servicePeriodEnd}
                  onChange={(e) => setServicePeriodEnd(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Zahlungsart</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Keine Angabe</option>
                  <option value="Überweisung">Überweisung</option>
                  <option value="Bar">Barzahlung</option>
                  <option value="Lastschrift">Lastschrift</option>
                  <option value="Karte">Kartenzahlung</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">
                  Währung <span className="text-primary">*</span>
                </Label>
                <select
                  id="currency"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'TRY' | 'USD' | 'EUR')}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US-Dollar ($)</option>
                  <option value="TRY">Türkische Lira (₺)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rechnungspositionen */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rechnungspositionen</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Position hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Position {index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-primary hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Produkt/Dienstleistung</Label>
                    <select
                      value={item.productId || ''}
                      onChange={(e) => selectProduct(index, e.target.value)}
                      className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <option value="">Manuelle Eingabe</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Beschreibung *</Label>
                    <Input
                      required
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, 'description', e.target.value)
                      }
                      placeholder="Dienstleistungs-/Produktbeschreibung"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Menge *</Label>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Einheit *</Label>
                    <Input
                      required
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Stückpreis *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, 'unitPrice', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>MwSt % *</Label>
                    <select
                      required
                      value={item.vatRate}
                      onChange={(e) =>
                        updateItem(index, 'vatRate', parseFloat(e.target.value))
                      }
                      className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <option value="0">0%</option>
                      <option value="7">7%</option>
                      <option value="19">19%</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <Label>Gesamt</Label>
                    <div className="h-9 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium">
                      {formatCurrency(
                        calculateInvoiceItem(
                          item.quantity,
                          item.unitPrice,
                          item.vatRate
                        ).total,
                        currency
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Summen */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="space-y-2 max-w-md ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Zwischensumme:</span>
                  <span className="font-medium">
                    {formatCurrency(totals.subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gesamt MwSt:</span>
                  <span className="font-medium">
                    {formatCurrency(totals.totalVat, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Gesamtsumme:</span>
                  <span className="text-primary">
                    {formatCurrency(totals.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notizen und Zahlungsbedingungen */}
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Rechnungsnotizen..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Zahlungsbedingungen</Label>
              <textarea
                id="paymentTerms"
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Zahlungskonditionen..."
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Link href="/invoices">
            <Button type="button" variant="outline">
              Abbrechen
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? 'Speichern...' : 'Aktualisieren'}
          </Button>
        </div>
      </form>
    </div>
  )
}
