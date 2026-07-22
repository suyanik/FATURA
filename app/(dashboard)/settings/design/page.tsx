'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Building2,
    CreditCard,
    Settings as SettingsIcon,
    Save,
    Bell,
    HelpCircle,
    Landmark,
    Palette,
    LayoutGrid,
    CheckCircle,
    Eye,
    ExternalLink,
    Minus,
    Plus,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Types for design settings
type Template = 'modern' | 'classic' | 'minimalist' | 'sidebar'
type FontFamily = 'Inter' | 'Roboto' | 'Merriweather' | 'Open Sans'
type LogoAlignment = 'left' | 'center' | 'right'

export default function DesignSettingsPage() {
    // State for design settings
    const [template, setTemplate] = useState<Template>('modern')
    const [primaryColor, setPrimaryColor] = useState('#CCFF00') // Default to our Lime
    const [font, setFont] = useState<FontFamily>('Inter')
    const [logoAlignment, setLogoAlignment] = useState<LogoAlignment>('left')
    const [footerText, setFooterText] = useState('')
    const [zoom, setZoom] = useState(85)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    // Predefined colors
    const colors = [
        '#CCFF00', // Lime (Project Default)
        '#135bec', // Stitch Blue
        '#e11d48', // Red
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#7c3aed', // Violet
        '#0ea5e9', // Sky
    ]

    const handleSave = async () => {
        setSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Rechnungsdesign</h1>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">Passen Sie das Aussehen Ihrer Rechnungen an Ihre Marke an.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden gap-8">

                {/* Sidebar Navigation */}
                <nav className="w-64 flex-shrink-0 hidden lg:block space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">Kategorie</p>
                    <Link
                        href="/settings"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    >
                        <SettingsIcon className="h-4 w-4" />
                        Allgemein
                    </Link>
                    <Link
                        href="/settings"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    >
                        <Building2 className="h-4 w-4" />
                        Unternehmen
                    </Link>
                    <Link
                        href="/settings"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    >
                        <Landmark className="h-4 w-4" />
                        Steuern
                    </Link>
                    <Link
                        href="/settings"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    >
                        <CreditCard className="h-4 w-4" />
                        Bankverbindung
                    </Link>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium bg-secondary text-primary"
                    >
                        <Palette className="h-4 w-4" />
                        Rechnungsdesign
                    </button>
                </nav>

                {/* Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-y-auto pr-2 pb-24">

                    {/* Left Control Panel */}
                    <div className="flex-1 space-y-8 max-w-2xl">

                        {/* Template Selection */}
                        <section>
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                Vorlage wählen
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Template: Modern */}
                                <div
                                    onClick={() => setTemplate('modern')}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-xl overflow-hidden transition-all relative group",
                                        template === 'modern' ? "border-primary shadow-md shadow-primary/10" : "border-transparent hover:border-border bg-card"
                                    )}
                                >
                                    <div className="aspect-[4/3] bg-secondary/30 p-4">
                                        <div className="w-full h-full bg-background border border-border shadow-sm flex flex-col p-2 space-y-2">
                                            <div className="h-4 w-1/3 bg-primary/20 rounded-full" style={{ backgroundColor: `${primaryColor}33` }}></div>
                                            <div className="space-y-1">
                                                <div className="h-2 w-full bg-secondary rounded"></div>
                                                <div className="h-2 w-full bg-secondary rounded"></div>
                                                <div className="h-2 w-2/3 bg-secondary rounded"></div>
                                            </div>
                                            <div className="flex-1"></div>
                                            <div className="h-8 w-full bg-secondary/50 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border flex items-center justify-between bg-card">
                                        <span className="text-sm font-medium">Modern (Standard)</span>
                                        {template === 'modern' && <CheckCircle className="h-4 w-4 text-primary" />}
                                    </div>
                                </div>

                                {/* Template: Classic */}
                                <div
                                    onClick={() => setTemplate('classic')}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-xl overflow-hidden transition-all relative group",
                                        template === 'classic' ? "border-primary shadow-md shadow-primary/10" : "border-transparent hover:border-border bg-card"
                                    )}
                                >
                                    <div className="aspect-[4/3] bg-secondary/30 p-4">
                                        <div className="w-full h-full bg-background border border-border shadow-sm flex flex-col p-2 space-y-2">
                                            <div className="h-4 w-4 rounded-full mx-auto" style={{ backgroundColor: primaryColor }}></div>
                                            <div className="h-2 w-1/2 bg-secondary rounded mx-auto"></div>
                                            <div className="space-y-1 pt-2">
                                                <div className="h-2 w-full bg-secondary rounded"></div>
                                                <div className="h-2 w-full bg-secondary rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border flex items-center justify-between bg-card">
                                        <span className="text-sm font-medium">Klassisch</span>
                                        {template === 'classic' && <CheckCircle className="h-4 w-4 text-primary" />}
                                    </div>
                                </div>

                                {/* Template: Minimalist */}
                                <div
                                    onClick={() => setTemplate('minimalist')}
                                    className={cn(
                                        "cursor-pointer border-2 rounded-xl overflow-hidden transition-all relative group",
                                        template === 'minimalist' ? "border-primary shadow-md shadow-primary/10" : "border-transparent hover:border-border bg-card"
                                    )}
                                >
                                    <div className="aspect-[4/3] bg-secondary/30 p-4">
                                        <div className="w-full h-full bg-background border border-border shadow-sm flex p-2 gap-2">
                                            <div className="w-1/4 h-full rounded-sm" style={{ backgroundColor: `${primaryColor}1A` }}></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-1/2 bg-secondary rounded"></div>
                                                <div className="h-2 w-full bg-secondary rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border flex items-center justify-between bg-card">
                                        <span className="text-sm font-medium">Minimalistisch</span>
                                        {template === 'minimalist' && <CheckCircle className="h-4 w-4 text-primary" />}
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* Customization Details */}
                        <Card className="rounded-xl border-border bg-card">
                            <CardContent className="p-6 space-y-8">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-primary" />
                                        Branding & Details
                                    </h2>

                                    {/* Color Picker */}
                                    <div className="space-y-4">
                                        <Label>Primärfarbe</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setPrimaryColor(color)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full border-2 transition-transform hover:scale-110",
                                                        primaryColor === color ? "border-foreground ring-2 ring-offset-2 ring-primary" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <div className="flex items-center ml-auto px-3 py-1 bg-secondary rounded-lg border border-border">
                                                <span className="text-xs font-mono text-muted-foreground uppercase">{primaryColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                    <div className="space-y-3">
                                        <Label>Schriftart</Label>
                                        <select
                                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                                            value={font}
                                            onChange={(e) => setFont(e.target.value as FontFamily)}
                                        >
                                            <option value="Inter">Inter (Modern)</option>
                                            <option value="Roboto">Roboto (Clean)</option>
                                            <option value="Merriweather">Merriweather (Serif)</option>
                                            <option value="Open Sans">Open Sans (Classic)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Logo-Ausrichtung</Label>
                                        <div className="flex bg-secondary p-1 rounded-lg">
                                            <button
                                                onClick={() => setLogoAlignment('left')}
                                                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", logoAlignment === 'left' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                Links
                                            </button>
                                            <button
                                                onClick={() => setLogoAlignment('center')}
                                                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", logoAlignment === 'center' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                Mitte
                                            </button>
                                            <button
                                                onClick={() => setLogoAlignment('right')}
                                                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", logoAlignment === 'right' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                Rechts
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <Label>Rechnungs-Fußzeile</Label>
                                    <Textarea
                                        placeholder="Bankverbindung, Steuernummern, etc."
                                        rows={3}
                                        value={footerText}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFooterText(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>

                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Preview Panel */}
                    <div className="w-full lg:w-[480px]">
                        <div className="sticky top-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                    Live-Vorschau
                                </h2>
                                <Button variant="link" size="sm" className="text-primary h-auto p-0">
                                    <ExternalLink className="h-3 w-3 mr-1" /> Fullscreen
                                </Button>
                            </div>

                            {/* Invoice Preview Container */}
                            <div
                                className="bg-white rounded-xl shadow-2xl overflow-hidden border border-border/50 origin-top transition-all duration-300"
                                style={{
                                    transform: `scale(${zoom / 100})`,
                                    // Keep aspect ratio of A4 roughly 1:1.414
                                    aspectRatio: '1/1.414',
                                    fontFamily: font
                                }}
                            >
                                <div className="p-8 h-full flex flex-col text-[10px] leading-relaxed text-slate-800">

                                    {/* Header */}
                                    <div className={cn("flex items-start mb-10", logoAlignment === 'center' ? 'flex-col items-center text-center' : (logoAlignment === 'right' ? 'flex-row-reverse text-right' : 'justify-between'))}>
                                        <div className={cn("space-y-4", logoAlignment === 'right' ? 'text-right' : 'text-left', logoAlignment === 'center' ? 'w-full mb-4' : '')}>
                                            <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${primaryColor}1A` }}>
                                                <Building2 className="h-5 w-5" style={{ color: primaryColor }} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold">Ihre Firma GmbH</p>
                                                <p className="text-slate-500">Musterstraße 123<br />12345 Berlin, DE</p>
                                            </div>
                                        </div>

                                        <div className={cn(logoAlignment === 'center' ? 'w-full flex justify-between items-start mt-6' : (logoAlignment === 'right' ? 'text-left self-start' : 'text-right'))}>
                                            {logoAlignment === 'center' && (
                                                <div className="text-left">
                                                    <p className="font-bold">Web Agency Global</p>
                                                    <p className="text-slate-500">Hafenstraße 12<br />20457 Hamburg</p>
                                                </div>
                                            )}
                                            <div className={cn(logoAlignment === 'center' ? 'text-right' : '')}>
                                                <h3 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">RECHNUNG</h3>
                                                <p className="text-slate-500">Nr. INV-2023-001</p>
                                                <p className="text-slate-500">Datum: 14. Okt. 2023</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client Info (if not centered logo layout which handled it above) */}
                                    {logoAlignment !== 'center' && (
                                        <div className="mb-10 flex gap-12">
                                            <div>
                                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px] mb-2">Empfänger</p>
                                                <p className="font-bold">Web Agency Global</p>
                                                <p className="text-slate-500">Hafenstraße 12<br />20457 Hamburg</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px] mb-2">Zahlungsziel</p>
                                                <p className="text-slate-500">28. Oktober 2023 (14 Tage)</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items Table */}
                                    <div className="flex-1">
                                        <div className="border-b border-slate-200 flex py-2 font-bold bg-slate-50 -mx-8 px-8 mb-2">
                                            <div className="flex-1">BESCHREIBUNG</div>
                                            <div className="w-16 text-right">MENGE</div>
                                            <div className="w-20 text-right">PREIS</div>
                                            <div className="w-20 text-right">GESAMT</div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex border-b border-slate-100 pb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium">Web Design & Branding</p>
                                                    <p className="text-[8px] text-slate-400">Complete UI kit and brand guidelines</p>
                                                </div>
                                                <div className="w-16 text-right">1</div>
                                                <div className="w-20 text-right">1.250,00 €</div>
                                                <div className="w-20 text-right font-medium">1.250,00 €</div>
                                            </div>
                                            <div className="flex border-b border-slate-100 pb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium">Frontend Development</p>
                                                    <p className="text-[8px] text-slate-400">React & Tailwind CSS Implementation</p>
                                                </div>
                                                <div className="w-16 text-right">40h</div>
                                                <div className="w-20 text-right">85,00 €</div>
                                                <div className="w-20 text-right font-medium">3.400,00 €</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="mt-8 flex justify-end">
                                        <div className="w-48 space-y-2">
                                            <div className="flex justify-between text-slate-500">
                                                <span>Zwischensumme</span>
                                                <span>4.650,00 €</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>MwSt (19%)</span>
                                                <span>883,50 €</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                                                <span className="font-bold">Gesamtbetrag</span>
                                                <span className="font-bold" style={{ color: primaryColor }}>5.533,50 €</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto pt-8 border-t border-slate-100 text-[8px] text-slate-400 flex justify-between">
                                        <div className="whitespace-pre-line">
                                            {footerText || 'Ihre Firma GmbH | Steuernummer: 12/345/67890\nGeschäftsführer: Max Mustermann'}
                                        </div>
                                        <div className="text-right">
                                            <p>Seite 1 von 1</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex justify-center items-center gap-4 bg-card border border-border rounded-full py-2 px-4 shadow-sm max-w-fit mx-auto">
                                <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-secondary rounded-full text-muted-foreground"><Minus className="h-4 w-4" /></button>
                                <span className="text-xs font-medium text-foreground w-8 text-center">{zoom}%</span>
                                <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 hover:bg-secondary rounded-full text-muted-foreground"><Plus className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Save Bar */}
            <div className="h-20 bg-background border-t border-border flex items-center justify-between px-0 z-10 mt-auto">
                <div className="flex items-center gap-2">
                    {success && <span className="text-emerald-600 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded">Einstellungen gespeichert</span>}
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="outline" className="text-muted-foreground">Abbrechen</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? 'Speichert...' : 'Speichern'}
                    </Button>
                </div>
            </div>

        </div>
    )
}
