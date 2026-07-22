import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Bu ayki fatura sayısı
    const monthlyInvoiceCount = await prisma.invoice.count({
      where: {
        issueDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    })

    // Toplam gelir (ödenen faturalar)
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
      },
      select: {
        total: true,
        currency: true,
      },
    })

    // Para birimine göre toplam gelir
    const totalRevenue = paidInvoices.reduce(
      (acc, invoice) => {
        const currency = invoice.currency
        const amount = parseFloat(invoice.total.toString())
        if (!acc[currency]) {
          acc[currency] = 0
        }
        acc[currency] += amount
        return acc
      },
      {} as Record<string, number>
    )

    // Bekleyen fatura sayısı (SENT durumunda)
    const pendingInvoiceCount = await prisma.invoice.count({
      where: {
        status: 'SENT',
      },
    })

    // Vadesi geçmiş fatura sayısı
    const overdueInvoiceCount = await prisma.invoice.count({
      where: {
        status: 'OVERDUE',
      },
    })

    // Son 6 ayın verileri
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const monthlyData = []

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const invoices = await prisma.invoice.findMany({
        where: {
          issueDate: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: 'PAID',
        },
        select: {
          total: true,
          currency: true,
        },
      })

      const totalAmount = invoices.reduce((sum, inv) => {
        return sum + parseFloat(inv.total.toString())
      }, 0)

      const count = invoices.length

      monthlyData.push({
        month: monthStart.toLocaleDateString('de-DE', {
          month: 'short',
          year: '2-digit',
        }),
        revenue: totalAmount,
        count,
      })
    }

    // En çok gelir getiren müşteriler (Top 5)
    const topCustomers = await prisma.invoice.groupBy({
      by: ['companyId'],
      where: {
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 5,
    })

    // Müşteri bilgilerini al
    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (customer) => {
        const company = await prisma.company.findUnique({
          where: { id: customer.companyId },
          select: { name: true },
        })

        return {
          name: company?.name || 'Bilinmeyen',
          totalRevenue: parseFloat(customer._sum.total?.toString() || '0'),
          invoiceCount: customer._count.id,
        }
      })
    )

    // Son 10 fatura
    const recentInvoices = await prisma.invoice.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    })

    const formattedRecentInvoices = recentInvoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      total: parseFloat(invoice.total.toString()),
      currency: invoice.currency,
      status: invoice.status,
      companyName: invoice.company?.name || 'Unbekannt',
    }))

    // Durum dağılımı
    const statusBreakdown = await prisma.invoice.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    const statusCounts = statusBreakdown.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      monthlyInvoiceCount,
      totalRevenue,
      pendingInvoiceCount,
      overdueInvoiceCount,
      monthlyData,
      topCustomers: topCustomersWithDetails,
      recentInvoices: formattedRecentInvoices,
      statusCounts,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    )
  }
}
