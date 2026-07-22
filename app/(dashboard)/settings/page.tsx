'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Hash,
  DollarSign,
  FileImage,
  Upload,
  X,
  CreditCard,
  Settings as SettingsIcon,
  Save,
  Bell,
  HelpCircle,
  Landmark,
  Palette
} from 'lucide-react'
import { VAT_RATES } from '@/types'
import Link from 'next/link'

interface InvoiceSettings {
  id: string
  companyName: string
  companyOwner: string | null
  companyTaxId: string
  companyUstIdNr: string | null
  kleinunternehmer: boolean
  companyTaxOffice: string
  companyAddress: string
  companyCity: string | null
  companyPostalCode: string | null
  companyPhone: string | null
  companyEmail: string | null
  companyWebsite: string | null
  companyLogo: string | null
  bankName: string | null
  bankAccountHolder: string | null
  bankIBAN: string | null
  bankBIC: string | null
  invoicePrefix: string
  invoiceNumberFormat: string
  currentYear: number
  currentCounter: number
  defaultCurrency: 'TRY' | 'USD' | 'EUR'
  defaultVatRate: number
  defaultPaymentTermDays: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeSection, setActiveSection] = useState('company')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Einstellungen konnten nicht geladen werden')
      }
      const data = await response.json()
      setSettings({
        ...data,
        defaultVatRate: parseFloat(data.defaultVatRate),
      })
      // Set initial logo preview if exists
      if (data.companyLogo) {
        setLogoPreview(data.companyLogo)
      }
    } catch (err) {
      setError('Fehler beim Laden der Einstellungen')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Bild darf maximal 2MB groß sein')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setLogoPreview(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      companyName: formData.get('companyName') as string,
      companyOwner: (formData.get('companyOwner') as string) || undefined,
      companyTaxId: formData.get('companyTaxId') as string,
      companyUstIdNr: (formData.get('companyUstIdNr') as string) || undefined,
      kleinunternehmer: formData.get('kleinunternehmer') === 'on',
      companyTaxOffice: formData.get('companyTaxOffice') as string,
      companyAddress: formData.get('companyAddress') as string,
      companyCity: (formData.get('companyCity') as string) || undefined,
      companyPostalCode: (formData.get('companyPostalCode') as string) || undefined,
      companyPhone: (formData.get('companyPhone') as string) || undefined,
      companyEmail: (formData.get('companyEmail') as string) || undefined,
      companyWebsite: (formData.get('companyWebsite') as string) || undefined,
      companyLogo: logoPreview || settings?.companyLogo || undefined,
      bankName: (formData.get('bankName') as string) || undefined,
      bankAccountHolder: (formData.get('bankAccountHolder') as string) || undefined,
      bankIBAN: (formData.get('bankIBAN') as string) || undefined,
      bankBIC: (formData.get('bankBIC') as string) || undefined,
      invoicePrefix: (formData.get('invoicePrefix') as string) || 'RE',
      // invoiceNumberFormat is disabled, so use current settings value
      invoiceNumberFormat: settings?.invoiceNumberFormat || 'YYYY-NNNN',
      defaultCurrency: (formData.get('defaultCurrency') as 'TRY' | 'USD' | 'EUR') || 'EUR',
      defaultVatRate: parseFloat((formData.get('defaultVatRate') as string) || '19'),
      defaultPaymentTermDays: parseInt((formData.get('defaultPaymentTermDays') as string) || '14'),
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Show detailed validation errors if available
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((err: { path?: string[]; message: string }) =>
            `${err.path?.join('.')} - ${err.message}`
          ).join(', ')
          setError(`${result.error}: ${errorMessages}`)
        } else {
          setError(result.error || 'Ein Fehler ist aufgetreten')
        }
        setSaving(false)
        return
      }

      setSuccess(true)
      setSettings({
        ...result,
        defaultVatRate: parseFloat(result.defaultVatRate),
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Verbindungsfehler')
    } finally {
      setSaving(false)
    }
  }

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Einstellungen nicht gefunden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Einstellungen</h1>
            <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihre Firmendaten und Systemeinstellungen.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" type="button">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" type="button">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden gap-8">

          {/* Sidebar Navigation */}
          <nav className="w-64 flex-shrink-0 hidden lg:block space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">Kategorie</p>
            <button
              type="button"
              onClick={() => scrollToSection('general')}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${activeSection === 'general' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <SettingsIcon className="h-4 w-4" />
              Allgemein
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('company')}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${activeSection === 'company' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <Building2 className="h-4 w-4" />
              Unternehmen
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tax')}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${activeSection === 'tax' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <Landmark className="h-4 w-4" />
              Steuern
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('bank')}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${activeSection === 'bank' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <CreditCard className="h-4 w-4" />
              Bankverbindung
            </button>
            <Link
              href="/settings/design"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            >
              <Palette className="h-4 w-4" />
              Rechnungsdesign
            </Link>
          </nav>

          {/* Main Content Sections */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-12 pb-24">

            {/* General Section */}
            <section id="general" className="scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">Allgemein</h2>
                <p className="text-sm text-muted-foreground">Grundlegende Systemeinstellungen.</p>
              </div>

              <div className="space-y-6">
                <Card className="rounded-xl shadow-sm border-border">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoicePrefix">Rechnungspräfix</Label>
                        <Input id="invoicePrefix" name="invoicePrefix" required defaultValue={settings.invoicePrefix} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invoiceNumberFormat">Format</Label>
                        <Input id="invoiceNumberFormat" name="invoiceNumberFormat" disabled defaultValue={settings.invoiceNumberFormat} className="bg-secondary/50" />
                        <p className="text-xs text-muted-foreground">Festes Format: YYYY-NNNN</p>
                      </div>
                    </div>
                    <div className="bg-secondary/20 border border-secondary rounded-lg p-4 flex items-center gap-3">
                      <Hash className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Nächste Rechnungsnummer</p>
                        <p className="text-xs text-muted-foreground">
                          {settings.invoicePrefix}-{settings.currentYear}-{(settings.currentCounter + 1).toString().padStart(4, '0')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border-border">
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultCurrency">Standard Währung</Label>
                      <select
                        id="defaultCurrency"
                        name="defaultCurrency"
                        required
                        defaultValue={settings.defaultCurrency}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">US-Dollar ($)</option>
                        <option value="TRY">Türkische Lira (₺)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultVatRate">Standard MwSt</Label>
                      <select
                        id="defaultVatRate"
                        name="defaultVatRate"
                        required
                        defaultValue={settings.defaultVatRate}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {VAT_RATES.map((rate) => (
                          <option key={rate.value} value={rate.value}>{rate.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultPaymentTermDays">Zahlungsziel (Tage)</Label>
                      <Input id="defaultPaymentTermDays" name="defaultPaymentTermDays" type="number" defaultValue={settings.defaultPaymentTermDays} className="bg-background" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <hr className="border-border" />

            {/* Company Section */}
            <section id="company" className="scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">Unternehmensdetails</h2>
                <p className="text-sm text-muted-foreground">Offizielle Firmendaten für Ihre Rechnungen.</p>
              </div>

              <Card className="rounded-xl shadow-sm border-border mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Firmenname</Label>
                      <Input id="companyName" name="companyName" required defaultValue={settings.companyName} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyOwner">Inhaber / Geschäftsführer</Label>
                      <Input id="companyOwner" name="companyOwner" defaultValue={settings.companyOwner || ''} className="bg-background" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="companyAddress">Adresse</Label>
                      <Input id="companyAddress" name="companyAddress" required defaultValue={settings.companyAddress} className="bg-background" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                      <div className="col-span-1 space-y-2">
                        <Label htmlFor="companyPostalCode">PLZ</Label>
                        <Input id="companyPostalCode" name="companyPostalCode" defaultValue={settings.companyPostalCode || ''} className="bg-background" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="companyCity">Stadt</Label>
                        <Input id="companyCity" name="companyCity" defaultValue={settings.companyCity || ''} className="bg-background" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Telefon</Label>
                      <Input id="companyPhone" name="companyPhone" defaultValue={settings.companyPhone || ''} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">E-Mail</Label>
                      <Input id="companyEmail" name="companyEmail" type="email" defaultValue={settings.companyEmail || ''} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Webseite</Label>
                      <Input id="companyWebsite" name="companyWebsite" type="url" defaultValue={settings.companyWebsite || ''} className="bg-background" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logo Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div>
                  <h3 className="text-md font-semibold text-foreground">Firmenlogo</h3>
                  <p className="text-xs text-muted-foreground mt-1">Erscheint auf allen Dokumenten.</p>
                </div>
                <div className="md:col-span-2">
                  <Card className="rounded-xl shadow-sm border-border">
                    <CardContent className="p-6 flex items-start gap-6">
                      <div className="w-24 h-24 bg-secondary/20 rounded-xl border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden group">
                        {(logoPreview || settings?.companyLogo) ? (
                          <>
                            <img src={logoPreview || settings?.companyLogo || ''} alt="Logo" className="w-full h-full object-contain p-2" />
                            <button type="button" onClick={handleRemoveLogo} className="absolute top-1 right-1 p-1 bg-destructive/80 text-white rounded-full hover:bg-destructive transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <Upload className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-3">
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                          <Label htmlFor="logo-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-block">
                            Logo hochladen
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">Empfohlen: PNG oder SVG, max 2MB.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <hr className="border-border" />

            {/* Tax Section */}
            <section id="tax" className="scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">Steuerinformationen</h2>
                <p className="text-sm text-muted-foreground">Wichtige Angaben für die Rechnungsstellung.</p>
              </div>
              <Card className="rounded-xl shadow-sm border-border">
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyTaxId">Steuernummer</Label>
                    <Input id="companyTaxId" name="companyTaxId" required defaultValue={settings.companyTaxId} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyTaxOffice">Finanzamt</Label>
                    <Input id="companyTaxOffice" name="companyTaxOffice" required defaultValue={settings.companyTaxOffice} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyUstIdNr">USt-IdNr (optional)</Label>
                    <Input id="companyUstIdNr" name="companyUstIdNr" placeholder="DE123456789" defaultValue={settings.companyUstIdNr || ''} className="bg-background" />
                    <p className="text-xs text-muted-foreground">Umsatzsteuer-Identifikationsnummer, falls vorhanden.</p>
                  </div>
                  <div className="space-y-2 flex items-start pt-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="kleinunternehmer"
                        defaultChecked={settings.kleinunternehmer}
                        className="h-4 w-4 rounded border-input accent-[#137fec]"
                      />
                      <span className="text-sm">
                        <span className="font-medium text-foreground">Kleinunternehmerregelung (§19 UStG)</span>
                        <span className="block text-xs text-muted-foreground">Rechnungen werden ohne MwSt ausgestellt, mit Pflichthinweis.</span>
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </section>

            <hr className="border-border" />

            {/* Bank Section */}
            <section id="bank" className="scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">Bankverbindung</h2>
                <p className="text-sm text-muted-foreground">Für Überweisungen auf Rechnungen.</p>
              </div>
              <Card className="rounded-xl shadow-sm border-border">
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bankname</Label>
                    <Input id="bankName" name="bankName" defaultValue={settings.bankName || ''} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountHolder">Kontoinhaber</Label>
                    <Input id="bankAccountHolder" name="bankAccountHolder" defaultValue={settings.bankAccountHolder || ''} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankIBAN">IBAN</Label>
                    <Input id="bankIBAN" name="bankIBAN" defaultValue={settings.bankIBAN || ''} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankBIC">BIC/SWIFT</Label>
                    <Input id="bankBIC" name="bankBIC" defaultValue={settings.bankBIC || ''} className="bg-background" />
                  </div>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>

        {/* Footer Save Bar */}
        <div className="h-20 bg-background border-t border-border flex items-center justify-between px-0 z-10 mt-auto">
          <div className="flex items-center gap-2">
            {error && <span className="text-destructive text-sm font-medium bg-destructive/10 px-3 py-1 rounded">{error}</span>}
            {success && <span className="text-emerald-600 text-sm font-medium bg-emerald-100 px-3 py-1 rounded">Gespeichert</span>}
          </div>
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" className="text-muted-foreground">Abbrechen</Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Speichert...' : 'Speichern'}
            </Button>
          </div>
        </div>

      </form>
    </div>
  )
}
