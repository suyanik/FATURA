import { z } from 'zod'

// Company (Kunde) validation
export const companySchema = z.object({
  customerNumber: z.string().optional(),
  name: z.string().min(1, 'Firmenname ist erforderlich'),
  taxId: z.string().optional(),
  ustIdNr: z
    .string()
    .regex(/^[A-Z]{2}[A-Za-z0-9]{2,13}$/, 'Ungültige USt-IdNr (z.B. DE123456789)')
    .optional()
    .or(z.literal('')),
  taxOffice: z.string().optional(),
  address: z.string().min(1, 'Adresse ist erforderlich'),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Deutschland'),
  phone: z.string().optional(),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein').optional().or(z.literal('')),
  website: z.string().url('Bitte geben Sie eine gültige Webseiten-Adresse ein').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

// ProductService (Produkt/Dienstleistung) validation
export const productSchema = z.object({
  code: z.string().min(1, 'Produktcode ist erforderlich'),
  name: z.string().min(1, 'Produktname ist erforderlich'),
  description: z.string().optional(),
  unit: z.string().default('Stk'),
  defaultPrice: z.number().min(0, 'Preis muss 0 oder größer sein').default(0),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('EUR'),
  defaultVatRate: z.number().min(0).max(100).default(19),
  isActive: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productSchema>

// InvoiceItem validation
export const invoiceItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  quantity: z.number().min(0.01, 'Menge muss größer als 0 sein'),
  unit: z.string().default('Stk'),
  unitPrice: z.number().min(0, 'Einzelpreis muss 0 oder größer sein'),
  vatRate: z.number().min(0).max(100, 'MwSt-Satz muss zwischen 0 und 100 liegen'),
  order: z.number().default(0),
})

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>

// Invoice validation
export const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .regex(/^[A-Za-z0-9][A-Za-z0-9\-\/]{2,29}$/, 'Ungültige Rechnungsnummer (z.B. RE-2026-0001)')
    .optional(),
  companyId: z.string().min(1, 'Kundenauswahl ist erforderlich'),
  issueDate: z.coerce.date(),
  serviceDate: z.coerce.date().optional(),
  servicePeriodStart: z.coerce.date().optional(),
  servicePeriodEnd: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  paymentDate: z.coerce.date().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED', 'OVERDUE']).default('DRAFT'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('EUR'),
  exchangeRate: z.number().min(0).default(1),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Mindestens eine Position muss hinzugefügt werden'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

// InvoiceSettings validation
export const invoiceSettingsSchema = z.object({
  companyName: z.string().min(1, 'Firmenname ist erforderlich'),
  companyOwner: z.string().optional(),
  companyTaxId: z.string().min(9, 'Steuernummer muss mindestens 9 Zeichen haben'),
  companyUstIdNr: z
    .string()
    .regex(/^[A-Z]{2}[A-Za-z0-9]{2,13}$/, 'Ungültige USt-IdNr (z.B. DE123456789)')
    .optional()
    .or(z.literal('')),
  companyTaxOffice: z.string().min(1, 'Finanzamt ist erforderlich'),
  companyAddress: z.string().min(1, 'Adresse ist erforderlich'),
  companyCity: z.string().optional(),
  companyPostalCode: z.string().optional(),
  companyCountry: z.string().default('Deutschland'),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein').optional().or(z.literal('')),
  companyWebsite: z.string().url('Bitte geben Sie eine gültige Webseiten-Adresse ein').optional().or(z.literal('')),
  companyLogo: z.string().optional(),
  kleinunternehmer: z.boolean().default(false),
  bankName: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bankIBAN: z
    .string()
    .regex(/^[A-Z]{2}[0-9]{2}[A-Za-z0-9 ]{10,32}$/, 'Ungültige IBAN')
    .optional()
    .or(z.literal('')),
  bankBIC: z.string().optional(),
  invoicePrefix: z.string().default('RE'),
  invoiceNumberFormat: z.string().default('YYYY-NNNN'),
  defaultCurrency: z.enum(['TRY', 'USD', 'EUR']).default('EUR'),
  defaultVatRate: z.number().min(0).max(100).default(19),
  defaultPaymentTermDays: z.number().min(0).default(14),
})

export type InvoiceSettingsFormData = z.infer<typeof invoiceSettingsSchema>

// User/Login validation
export const loginSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  pin: z.string().length(4, 'PIN muss 4-stellig sein').regex(/^\d+$/, 'PIN darf nur aus Zahlen bestehen'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const userSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  name: z.string().min(1, 'Name ist erforderlich'),
  pin: z.string().length(4, 'PIN muss 4-stellig sein').regex(/^\d+$/, 'PIN darf nur aus Zahlen bestehen'),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
})

export type UserFormData = z.infer<typeof userSchema>
