'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { unitOptions, VAT_RATES } from '@/types'

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  unit: string
  defaultPrice: number
  currency: 'TRY' | 'USD' | 'EUR'
  defaultVatRate: number
  isActive: boolean
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [productId, setProductId] = useState<string>('')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then((p) => {
      setProductId(p.id)
      fetchProduct(p.id)
    })
  }, [])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        throw new Error('Produkt nicht gefunden')
      }
      const data = await response.json()
      // Convert Decimal to number for form
      setProduct({
        ...data,
        defaultPrice: parseFloat(data.defaultPrice),
        defaultVatRate: parseFloat(data.defaultVatRate),
      })
    } catch (err) {
      setError('Fehler beim Laden des Produkts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

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
      const response = await fetch(`/api/products/${productId}`, {
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

      router.push('/products')
      router.refresh()
    } catch (err) {
      setError('Verbindungsfehler')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Laden...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Produkt nicht gefunden</p>
          <Link href="/products">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
              Zurück zu Produkten
            </Button>
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Produkt/Dienstleistung bearbeiten</h1>
          <p className="mt-2 text-gray-600">{product.name}</p>
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
                  defaultValue={product.code}
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
                  defaultValue={product.name}
                  placeholder="Webseiten-Entwicklung"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={product.description || ''}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  placeholder="Produkt- oder Dienstleistungsbeschreibung..."
                />
              </div>
            </div>

            {/* Fiyat Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPrice">
                  Stückpreis <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="defaultPrice"
                  name="defaultPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={product.defaultPrice}
                  placeholder="1000.00"
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
                  defaultValue={product.currency}
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
                  defaultValue={product.unit}
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
                  defaultValue={product.defaultVatRate}
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
                defaultChecked={product.isActive}
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
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Speichern...' : 'Aktualisieren'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
