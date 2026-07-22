'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  taxId: string | null
  ustIdNr: string | null
  taxOffice: string | null
  address: string
  city: string | null
  postalCode: string | null
  country: string
  phone: string | null
  email: string | null
  website: string | null
  notes: string | null
}

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState<string>('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then((p) => {
      setCustomerId(p.id)
      fetchCustomer(p.id)
    })
  }, [])

  const fetchCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`)
      if (!response.ok) {
        throw new Error('Kunde nicht gefunden')
      }
      const data = await response.json()
      setCustomer(data)
    } catch (err) {
      setError('Fehler beim Laden des Kunden')
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
      name: formData.get('name') as string,
      taxId: (formData.get('taxId') as string) || undefined,
      ustIdNr: (formData.get('ustIdNr') as string) || undefined,
      taxOffice: (formData.get('taxOffice') as string) || undefined,
      address: formData.get('address') as string,
      city: formData.get('city') as string || undefined,
      postalCode: formData.get('postalCode') as string || undefined,
      country: formData.get('country') as string || 'Deutschland',
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      website: formData.get('website') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
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

      router.push('/customers')
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

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Kunde nicht gefunden</p>
          <Link href="/customers">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
              Zurück zu Kunden
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kunde bearbeiten</h1>
          <p className="mt-2 text-gray-600">{customer.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kundendaten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Unternehmensdaten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Firmenname <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={customer.name}
                  placeholder="ABC Technologie GmbH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Steuernummer</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  defaultValue={customer.taxId || ''}
                  placeholder="123/456/78901"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ustIdNr">USt-IdNr</Label>
                <Input
                  id="ustIdNr"
                  name="ustIdNr"
                  defaultValue={customer.ustIdNr || ''}
                  placeholder="DE123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxOffice">Finanzamt</Label>
                <Input
                  id="taxOffice"
                  name="taxOffice"
                  defaultValue={customer.taxOffice || ''}
                  placeholder="Finanzamt Berlin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={customer.country}
                  placeholder="Deutschland"
                />
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Adresse <span className="text-blue-600">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  required
                  defaultValue={customer.address}
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={customer.city || ''}
                  placeholder="Berlin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postleitzahl</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  defaultValue={customer.postalCode || ''}
                  placeholder="10115"
                />
              </div>
            </div>

            {/* Kontaktinformationen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={customer.phone || ''}
                  placeholder="+49 30 12345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer.email || ''}
                  placeholder="info@firma.de"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={customer.website || ''}
                  placeholder="https://www.firma.de"
                />
              </div>
            </div>

            {/* Notlar */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={customer.notes || ''}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                placeholder="Zusätzliche Informationen..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href="/customers">
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
