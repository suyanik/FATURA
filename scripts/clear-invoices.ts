import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function clearInvoices() {
  try {
    console.log('🗑️  Faturalar siliniyor...\n')

    // Önce fatura kalemlerini sil (foreign key constraint)
    const deletedItems = await prisma.invoiceItem.deleteMany({})
    console.log(`✓ ${deletedItems.count} fatura kalemi silindi`)

    // Sonra faturaları sil
    const deletedInvoices = await prisma.invoice.deleteMany({})
    console.log(`✓ ${deletedInvoices.count} fatura silindi`)

    // Fatura numarasını sıfırla
    const currentYear = new Date().getFullYear()
    await prisma.invoiceSettings.updateMany({
      data: {
        currentCounter: 0,
        currentYear: currentYear,
      },
    })
    console.log('✓ Fatura numarası sıfırlandı')

    console.log('\n✅ Tüm faturalar başarıyla silindi!')
    console.log('Bir sonraki fatura numarası: RE-2026-0001 olacak\n')
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearInvoices()
