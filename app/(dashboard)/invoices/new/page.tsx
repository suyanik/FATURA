'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Save,
  ChevronDown,
  Calendar as CalendarIcon,
  UserPlus
} from 'lucide-react'
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

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')

  // Data
  const [companies, setCompanies] = useState<Company[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form state
  const [companyId, setCompanyId] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceDate, setServiceDate] = useState('')
  const [servicePeriodStart, setServicePeriodStart] = useState('')
  const [servicePeriodEnd, setServicePeriodEnd] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>('EUR')
  const [notes, setNotes] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Überweisung')
  const [status, setStatus] = useState<'DRAFT' | 'SENT'>('DRAFT')

  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productId: undefined,
      description: '',
      quantity: 1,
      unit: 'Stk',
      unitPrice: 0,
      vatRate: 19,
    },
  ])

  const fetchData = async () => {
    try {
      const [companiesRes, productsRes, nextNumberRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/products?active=true'),
        fetch('/api/invoices/next-number'),
      ])

      const companiesData = await companiesRes.json()
      const productsData = await productsRes.json()
      const nextNumberData = await nextNumberRes.json()

      setCompanies(companiesData)
      setProducts(productsData)
      setNextInvoiceNumber(nextNumberData.invoiceNumber)
      setInvoiceNumber(nextNumberData.invoiceNumber)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setLoading(true)

    const data = {
      invoiceNumber: invoiceNumber.trim() || undefined,
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
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((err: { path?: string[]; message: string }) =>
            `${err.path?.join('.')} - ${err.message}`
          ).join(', ')
          setError(`${result.error}: ${errorMessages}`)
        } else {
          setError(result.error || 'Ein Fehler ist aufgetreten')
        }
        setLoading(false)
        return
      }

      router.push('/invoices')
      router.refresh()
    } catch (err) {
      setError('Verbindungsfehler')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/invoices" className="hover:text-primary transition-colors">Rechnungen</Link>
            <ChevronDown className="h-4 w-4 -rotate-90" />
            <span className="text-foreground font-medium">Neue Rechnung</span>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Vorschau
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Save className="h-4 w-4" />
              {loading ? 'Speichern...' : 'Rechnung speichern'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {/* Invoice Header Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Customer Selection */}
          <Card className="md:col-span-1 shadow-sm">
            <CardContent className="p-6">
              <Label htmlFor="company" className="text-sm font-semibold mb-2 block">Kunden auswählen</Label>
              <div className="relative">
                <select
                  id="company"
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all"
                >
                  <option value="">Kunde wählen...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <Link href="/customers/new" className="mt-2 inline-flex items-center text-primary text-sm font-medium gap-1 hover:text-primary/80">
                <UserPlus className="h-4 w-4" />
                Neuen Kunden anlegen
              </Link>
            </CardContent>
          </Card>

          {/* Invoice Meta Data */}
          <Card className="md:col-span-2 shadow-sm">
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber" className="text-sm font-semibold">Rechnungsnummer</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder={nextInvoiceNumber || 'Laden...'}
                  className="bg-background font-mono"
                />
                {invoiceNumber !== nextInvoiceNumber && nextInvoiceNumber && (
                  <p className="text-[11px] text-warning">
                    Manuell geändert (automatisch: {nextInvoiceNumber})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-sm font-semibold">Rechnungsdatum</Label>
                <Input
                  id="issueDate"
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-semibold">Fälligkeitsdatum</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDate" className="text-sm font-semibold">Leistungsdatum</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="bg-background"
                />
                <p className="text-[11px] text-muted-foreground">Oder Leistungszeitraum angeben</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicePeriodStart" className="text-sm font-semibold">Leistungszeitraum von</Label>
                <Input
                  id="servicePeriodStart"
                  type="date"
                  value={servicePeriodStart}
                  onChange={(e) => setServicePeriodStart(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicePeriodEnd" className="text-sm font-semibold">Leistungszeitraum bis</Label>
                <Input
                  id="servicePeriodEnd"
                  type="date"
                  value={servicePeriodEnd}
                  onChange={(e) => setServicePeriodEnd(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm font-semibold">Zahlungsart</Label>
                <div className="relative">
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all"
                  >
                    <option value="Überweisung">Überweisung</option>
                    <option value="Bar">Barzahlung</option>
                    <option value="Lastschrift">Lastschrift</option>
                    <option value="Karte">Kartenzahlung</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items Table */}
        <Card className="shadow-sm overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-12">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Beschreibung</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">Menge</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">Einheit</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32">Preis</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">MwSt</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32 text-right">Gesamt</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 text-muted-foreground text-sm align-top pt-5">{index + 1}</td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-2">
                        <select
                          value={item.productId || ''}
                          onChange={(e) => selectProduct(index, e.target.value)}
                          className="w-full text-sm border-none bg-transparent p-0 focus:ring-0 font-medium text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                        >
                          <option value="">Manuelle Eingabe wählen...</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Beschreibung der Leistung..."
                          className="border-0 border-b rounded-none px-0 py-1 bg-transparent focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="border-0 border-b rounded-none px-0 py-1 bg-transparent focus-visible:ring-0 focus-visible:border-primary text-center"
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="border-0 border-b rounded-none px-0 py-1 bg-transparent focus-visible:ring-0 focus-visible:border-primary text-center"
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="relative">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="border-0 border-b rounded-none px-0 py-1 bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                        />
                        <span className="absolute right-0 top-1 text-muted-foreground text-xs pointer-events-none">€</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <select
                        value={item.vatRate}
                        onChange={(e) => updateItem(index, 'vatRate', parseFloat(e.target.value))}
                        className="w-full text-sm border-none bg-transparent p-0 focus:ring-0 text-right pr-2 cursor-pointer"
                      >
                        <option value="0">0%</option>
                        <option value="7">7%</option>
                        <option value="19">19%</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground align-top pt-5">
                      {formatCurrency(
                        calculateInvoiceItem(item.quantity, item.unitPrice, item.vatRate).total,
                        currency
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-top pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-secondary/10">
            <Button type="button" variant="ghost" onClick={addItem} className="text-primary hover:text-primary hover:bg-primary/10 gap-2 font-medium">
              <Plus className="h-4 w-4" />
              Position hinzufügen
            </Button>
          </div>
        </Card>

        {/* Footer Summary and Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">Notizen</Label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Zahlbar innerhalb von 14 Tagen ohne Abzug. Vielen Dank für Ihren Auftrag."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms" className="text-sm font-semibold">Zahlungsbedingungen</Label>
              <textarea
                id="paymentTerms"
                rows={2}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Zusätzliche Zahlungskonditionen..."
              />
            </div>
          </div>

          <Card className="shadow-sm border-border bg-secondary/20">
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Zwischensumme</span>
                <span>{formatCurrency(totals.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>MwSt</span>
                <span>{formatCurrency(totals.totalVat, currency)}</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Gesamtbetrag</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totals.total, currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

