import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || '',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Datenbank wird initialisiert...')

  // Create admin user
  const hashedPin = await bcrypt.hash('1234', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@invoice.com' },
    update: {},
    create: {
      email: 'admin@invoice.com',
      name: 'Admin',
      pin: hashedPin,
      role: 'ADMIN',
    },
  })
  console.log('✓ Admin-Benutzer erstellt:', admin.email)

  // Clean existing data to ensure we start fresh for the example
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.productService.deleteMany()
  await prisma.company.deleteMany()
  await prisma.invoiceSettings.deleteMany()

  // Create invoice settings (Company Info - Yordanova Transport)
  const currentYear = 2026
  const settings = await prisma.invoiceSettings.create({
    data: {
      id: 'default',
      companyName: 'Yordanova Transport',
      companyTaxId: '044 884 62353',
      companyTaxOffice: 'Offenbach am Main',
      companyAddress: 'Neusalzer Ssr. 77',
      companyPhone: '+49 152 13573383',
      companyEmail: 'transport.yordanov@gmail.com',
      currentYear,
      currentCounter: 12,
      invoicePrefix: 'RE',
      invoiceNumberFormat: 'YYYY-NNNN',
      defaultCurrency: 'EUR',
      defaultVatRate: 19,
      defaultPaymentTermDays: 3,
    },
  })
  console.log('✓ Firma "Yordanova Transport" erstellt')

  // Create sample company (Customer - MERO Handel & Logistik GmbH)
  const customer = await prisma.company.create({
    data: {
      name: 'MERO Handel & Logistik GmbH',
      taxId: 'DE342675819',
      taxOffice: 'Groß Gerau',
      address: 'Fasanenweg 5',
      postalCode: '65451',
      city: 'Kelsterbach',
      email: 'invoice@mero-logistik.de',
      country: 'Deutschland',
    },
  })
  console.log('✓ Kunde "MERO" erstellt')

  // Create sample product/service
  const product1 = await prisma.productService.create({
    data: {
      code: 'LKW-001',
      name: 'Be- und Entladen von LKW',
      description: 'Be- und Entladen von LKW',
      unit: 'Pauschal',
      defaultPrice: 3747.72,
      currency: 'EUR',
      defaultVatRate: 19,
      isActive: true,
    },
  })
  console.log('✓ Produkt "Be- und Entladen von LKW" erstellt')

  // Create the exact specific Invoice RE-2026-0012
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'RE-2026-0012',
      companyId: customer.id,
      issueDate: new Date('2025-12-30T10:00:00Z'),
      dueDate: new Date('2026-01-02T10:00:00Z'),
      status: 'SENT',
      currency: 'EUR',
      exchangeRate: 1,
      paymentTerms: 'Bar Bezahlt',
      notes: '',
      subtotal: 3747.72,
      totalVat: 712.07,
      total: 4459.79,
      createdById: admin.id,
      items: {
        create: [
          {
            productId: product1.id,
            description: 'Be- und Entladen von LKW',
            quantity: 1,
            unit: 'Pauschal',
            unitPrice: 3747.72,
            vatRate: 19,
            vatAmount: 712.07,
            subtotal: 3747.72,
            total: 4459.79,
            order: 0,
          }
        ]
      }
    }
  })
  console.log('✓ Rechnung "RE-2026-0012" erstellt')

  console.log('✅ Initialisierung abgeschlossen! Alle Daten entsprechen der Rechnung.')
}

main()
  .catch((e) => {
    console.error('❌ Initialisierung fehlgeschlagen:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
