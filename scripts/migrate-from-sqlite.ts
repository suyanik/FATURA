/**
 * Migration: SQLite (dev.db) → PostgreSQL (Supabase)
 *
 * Verwendung:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/migrate-from-sqlite.ts
 *
 * Liest alle Daten aus der lokalen dev.db und überträgt sie
 * in die in DATABASE_URL konfigurierte Postgres-Datenbank.
 */
import 'dotenv/config'
import { createClient } from '@libsql/client'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const SQLITE_PATH = process.env.SQLITE_PATH || 'file:./dev.db'

const sqlite = createClient({ url: SQLITE_PATH })

const pgUrl = process.env.DATABASE_URL
if (!pgUrl || !pgUrl.startsWith('postgres')) {
  console.error('❌ DATABASE_URL muss auf eine Postgres-Datenbank zeigen.')
  process.exit(1)
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: pgUrl }),
})

type Row = Record<string, unknown>

const toDate = (v: unknown): Date | null => {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return new Date(v)
  if (typeof v === 'string') {
    const n = Number(v)
    if (!Number.isNaN(n) && v.trim() !== '' && !v.includes('-')) {
      return new Date(n)
    }
    return new Date(v)
  }
  return null
}

const toStr = (v: unknown): string | null =>
  v === null || v === undefined ? null : String(v)

const toNum = (v: unknown): number =>
  v === null || v === undefined ? 0 : Number(v)

async function rows(table: string): Promise<Row[]> {
  const res = await sqlite.execute(`SELECT * FROM "${table}"`)
  return res.rows as unknown as Row[]
}

async function main() {
  console.log('📦 Migration SQLite → PostgreSQL startet...\n')

  // 1. User
  const users = await rows('User')
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: String(u.id) },
      update: {},
      create: {
        id: String(u.id),
        email: String(u.email),
        name: String(u.name),
        pin: String(u.pin),
        role: (toStr(u.role) as 'ADMIN' | 'STAFF') || 'STAFF',
        createdAt: toDate(u.createdAt) || new Date(),
        updatedAt: toDate(u.updatedAt) || new Date(),
      },
    })
  }
  console.log(`✓ ${users.length} Benutzer migriert`)

  // 2. Company
  const companies = await rows('Company')
  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: String(c.id) },
      update: {},
      create: {
        id: String(c.id),
        name: String(c.name),
        taxId: toStr(c.taxId),
        taxOffice: toStr(c.taxOffice),
        address: String(c.address),
        city: toStr(c.city),
        postalCode: toStr(c.postalCode),
        country: toStr(c.country) || 'Deutschland',
        phone: toStr(c.phone),
        email: toStr(c.email),
        website: toStr(c.website),
        notes: toStr(c.notes),
        createdAt: toDate(c.createdAt) || new Date(),
        updatedAt: toDate(c.updatedAt) || new Date(),
      },
    })
  }
  console.log(`✓ ${companies.length} Kunden migriert`)

  // 3. ProductService
  const products = await rows('ProductService')
  for (const p of products) {
    await prisma.productService.upsert({
      where: { id: String(p.id) },
      update: {},
      create: {
        id: String(p.id),
        code: String(p.code),
        name: String(p.name),
        description: toStr(p.description),
        unit: toStr(p.unit) || 'Stk',
        defaultPrice: toNum(p.defaultPrice),
        currency: (toStr(p.currency) as 'EUR' | 'USD' | 'TRY') || 'EUR',
        defaultVatRate: toNum(p.defaultVatRate),
        isActive: Boolean(p.isActive),
        createdAt: toDate(p.createdAt) || new Date(),
        updatedAt: toDate(p.updatedAt) || new Date(),
      },
    })
  }
  console.log(`✓ ${products.length} Produkte migriert`)

  // 4. InvoiceSettings
  const settings = await rows('InvoiceSettings')
  for (const s of settings) {
    await prisma.invoiceSettings.upsert({
      where: { id: String(s.id) },
      update: {},
      create: {
        id: String(s.id),
        companyName: String(s.companyName),
        companyTaxId: String(s.companyTaxId),
        companyTaxOffice: String(s.companyTaxOffice),
        companyAddress: String(s.companyAddress),
        companyCity: toStr(s.companyCity),
        companyPostalCode: toStr(s.companyPostalCode),
        companyPhone: toStr(s.companyPhone),
        companyEmail: toStr(s.companyEmail),
        companyWebsite: toStr(s.companyWebsite),
        companyLogo: toStr(s.companyLogo),
        bankName: toStr(s.bankName),
        bankAccountHolder: toStr(s.bankAccountHolder),
        bankIBAN: toStr(s.bankIBAN),
        bankBIC: toStr(s.bankBIC),
        invoicePrefix: toStr(s.invoicePrefix) || 'RE',
        invoiceNumberFormat: toStr(s.invoiceNumberFormat) || 'YYYY-NNNN',
        currentYear: toNum(s.currentYear),
        currentCounter: toNum(s.currentCounter),
        defaultCurrency: (toStr(s.defaultCurrency) as 'EUR' | 'USD' | 'TRY') || 'EUR',
        defaultVatRate: toNum(s.defaultVatRate),
        defaultPaymentTermDays: toNum(s.defaultPaymentTermDays),
        createdAt: toDate(s.createdAt) || new Date(),
        updatedAt: toDate(s.updatedAt) || new Date(),
      },
    })
  }
  console.log(`✓ ${settings.length} Einstellungen migriert`)

  // 5. Invoice
  const invoices = await rows('Invoice')
  for (const i of invoices) {
    await prisma.invoice.upsert({
      where: { id: String(i.id) },
      update: {},
      create: {
        id: String(i.id),
        invoiceNumber: String(i.invoiceNumber),
        companyId: String(i.companyId),
        issueDate: toDate(i.issueDate) || new Date(),
        dueDate: toDate(i.dueDate),
        paymentDate: toDate(i.paymentDate),
        status:
          (toStr(i.status) as 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED' | 'OVERDUE') ||
          'DRAFT',
        currency: (toStr(i.currency) as 'EUR' | 'USD' | 'TRY') || 'EUR',
        exchangeRate: toNum(i.exchangeRate) || 1,
        subtotal: toNum(i.subtotal),
        totalVat: toNum(i.totalVat),
        total: toNum(i.total),
        notes: toStr(i.notes),
        paymentTerms: toStr(i.paymentTerms),
        createdById: String(i.createdById),
        createdAt: toDate(i.createdAt) || new Date(),
        updatedAt: toDate(i.updatedAt) || new Date(),
      },
    })
  }
  console.log(`✓ ${invoices.length} Rechnungen migriert`)

  // 6. InvoiceItem
  const items = await rows('InvoiceItem')
  for (const it of items) {
    await prisma.invoiceItem.upsert({
      where: { id: String(it.id) },
      update: {},
      create: {
        id: String(it.id),
        invoiceId: String(it.invoiceId),
        productId: toStr(it.productId),
        description: String(it.description),
        quantity: toNum(it.quantity),
        unit: toStr(it.unit) || 'Stk',
        unitPrice: toNum(it.unitPrice),
        vatRate: toNum(it.vatRate),
        vatAmount: toNum(it.vatAmount),
        subtotal: toNum(it.subtotal),
        total: toNum(it.total),
        order: toNum(it.order),
        createdAt: toDate(it.createdAt) || new Date(),
        updatedAt: toDate(it.updatedAt) || new Date(),
      },
    })
  }
  console.log(`✓ ${items.length} Rechnungspositionen migriert`)

  console.log('\n✅ Migration abgeschlossen!')
}

main()
  .catch((e) => {
    console.error('❌ Migration fehlgeschlagen:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    sqlite.close()
  })
