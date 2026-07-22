'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { unitOptions, VAT_RATES } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      unit: formData.get('unit') as string || 'Stk',
      defaultPrice: parseFloat(formData.get('defaultPrice') as string) || 0,
      currency: formData.get('currency') as 'TRY' | 'USD' | 'EUR',
      defaultVatRate: parseFloat(formData.get('defaultVatRate') as string),
      isActive: formData.get('isActive') === 'on',
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Ein Fehler ist aufgetreten')
        setLoading(false)
        return
      }

      router.push('/products')
      router.refresh()
    } catch (err) {
      setError('Verbindungsfehler')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Neues Produkt/Dienstleistung</h1>
          <p className="mt-2 text-gray-600">Geben Sie die Produkt- oder Dienstleistungsdaten ein</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produkt-/Dienstleistungsdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Produktcode <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  required
                  placeholder="PROD-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Produkt-/Dienstleistungsname <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Webseiten-Entwicklung"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  placeholder="Produkt- oder Dienstleistungsbeschreibung..."
                />
              </div>
            </div>

            {/* Fiyat Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPrice">
                  Stückpreis
                </Label>
                <Input
                  id="defaultPrice"
                  name="defaultPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  defaultValue="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">
                  Währung <span className="text-blue-600">*</span>
                </Label>
                <select
                  id="currency"
                  name="currency"
                  required
                  defaultValue="EUR"
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US-Dollar ($)</option>
                  <option value="TRY">Türkische Lira (₺)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Einheit <span className="text-blue-600">*</span>
                </Label>
                <select
                  id="unit"
                  name="unit"
                  required
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultVatRate">
                  MwSt-Satz (%) <span className="text-blue-600">*</span>
                </Label>
                <select
                  id="defaultVatRate"
                  name="defaultVatRate"
                  required
                  defaultValue="19"
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {VAT_RATES.map((rate) => (
                    <option key={rate.value} value={rate.value}>
                      {rate.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Durum */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktiv (Kann in Rechnungen verwendet werden)
              </Label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href="/products">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
