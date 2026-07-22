import { InvoiceStatus, Currency, UserRole } from '@prisma/client'

// Re-export Prisma enums
export { InvoiceStatus, Currency, UserRole }

// Labels for German UI
export const labels = {
  // Common
  save: 'Speichern',
  cancel: 'Abbrechen',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  create: 'Erstellen',
  search: 'Suchen',
  filter: 'Filtern',
  actions: 'Aktionen',
  loading: 'Lädt...',
  noData: 'Keine Daten gefunden',

  // Invoice
  invoice: 'Rechnung',
  invoices: 'Rechnungen',
  invoiceNumber: 'Rechnungsnummer',
  newInvoice: 'Neue Rechnung',
  editInvoice: 'Rechnung bearbeiten',
  invoiceDetails: 'Rechnungsdetails',

  // Company
  customer: 'Kunde',
  customers: 'Kunden',
  company: 'Kunde',
  companyName: 'Firmenname',
  newCustomer: 'Neuer Kunde',

  // Dates
  issueDate: 'Rechnungsdatum',
  dueDate: 'Fälligkeitsdatum',
  paymentDate: 'Zahlungsdatum',
  date: 'Datum',

  // Money
  subtotal: 'Zwischensumme',
  vat: 'MwSt',
  total: 'Gesamt',
  amount: 'Betrag',
  price: 'Preis',
  unitPrice: 'Einzelpreis',
  currency: 'Währung',

  // Tax
  taxId: 'Steuernummer',
  taxOffice: 'Finanzamt',
  vatRate: 'MwSt-Satz',

  // Items
  quantity: 'Menge',
  unit: 'Einheit',
  description: 'Beschreibung',
  items: 'Positionen',
  addItem: 'Position hinzufügen',

  // Contact
  address: 'Adresse',
  city: 'Stadt',
  postalCode: 'PLZ',
  country: 'Land',
  phone: 'Telefon',
  email: 'E-Mail',
  website: 'Webseite',

  // Status
  status: 'Status',
  draft: 'Entwurf',
  sent: 'Versendet',
  paid: 'Bezahlt',
  cancelled: 'Storniert',
  overdue: 'Überfällig',

  // Product
  product: 'Produkt',
  products: 'Produkte',
  productCode: 'Produktcode',
  productName: 'Produktname',

  // Other
  notes: 'Notizen',
  paymentTerms: 'Zahlungsbedingungen',
  settings: 'Einstellungen',
  dashboard: 'Dashboard',
  logout: 'Abmelden',
} as const

// Status labels (German)
export const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Entwurf',
  SENT: 'Versendet',
  PAID: 'Bezahlt',
  CANCELLED: 'Storniert',
  OVERDUE: 'Überfällig',
}

// Status colors for badges
export const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border border-border',
  SENT: 'bg-primary/10 text-primary border border-primary/20',
  PAID: 'bg-success/10 text-success border border-success/20',
  CANCELLED: 'bg-muted text-muted-foreground border border-border line-through',
  OVERDUE: 'bg-destructive/10 text-destructive border border-destructive/20',
}

// Currency labels (German)
export const currencyLabels: Record<Currency, string> = {
  TRY: 'Türkische Lira (₺)',
  USD: 'US-Dollar ($)',
  EUR: 'Euro (€)',
}

// Unit options (German)
export const unitOptions = [
  { value: 'Stk', label: 'Stück' },
  { value: 'Kg', label: 'Kilogramm (kg)' },
  { value: 'L', label: 'Liter (L)' },
  { value: 'm', label: 'Meter (m)' },
  { value: 'm²', label: 'Quadratmeter (m²)' },
  { value: 'm³', label: 'Kubikmeter (m³)' },
  { value: 'h', label: 'Stunde (h)' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Monat', label: 'Monat' },
  { value: 'Jahr', label: 'Jahr' },
  { value: 'Pauschal', label: 'Pauschal' },
  { value: 'Set', label: 'Set' },
] as const

// German VAT rates
export const VAT_RATES = [
  { value: 0, label: '0%' },
  { value: 7, label: '7% (ermäßigt)' },
  { value: 19, label: '19% (Regelsteuersatz)' },
] as const

export const DEFAULT_VAT_RATE = 19
