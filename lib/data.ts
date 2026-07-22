import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
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



    // Vergi İstatistikleri (Net, KDV, Brüt) - PAID ve SENT
    const taxStatsInvoices = await prisma.invoice.findMany({
        where: {
            status: { in: ['PAID', 'SENT'] }
        },
        select: {
            subtotal: true,
            totalVat: true,
            total: true,
            currency: true
        }
    })

    const taxStats = taxStatsInvoices.reduce((acc, inv) => {
        const currency = inv.currency
        if (!acc[currency]) {
            acc[currency] = { net: 0, tax: 0, gross: 0 }
        }
        acc[currency].net += parseFloat(inv.subtotal.toString())
        acc[currency].tax += parseFloat(inv.totalVat.toString())
        acc[currency].gross += parseFloat(inv.total.toString())
        return acc
    }, {} as Record<string, { net: number, tax: number, gross: number }>)

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
                status: {
                    in: ['PAID', 'SENT'],
                },
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
    // ÖDENMİŞ ve GÖNDERİLMİŞ faturaları dahil et
    const topCustomers = await prisma.invoice.groupBy({
        by: ['companyId'],
        where: {
            status: {
                in: ['PAID', 'SENT'],
            },
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
        issueDate: invoice.issueDate,
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

    return {
        monthlyInvoiceCount,
        totalRevenue,
        pendingInvoiceCount,
        overdueInvoiceCount,
        monthlyData,
        topCustomers: topCustomersWithDetails,
        recentInvoices: formattedRecentInvoices,
        statusCounts,
        taxStats,
    }
}

export async function getYearlyReport(year: number = new Date().getFullYear()) {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const invoices = await prisma.invoice.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            status: true,
            total: true,
            currency: true,
            createdAt: true,
        },
    })

    const report = {
        paid: { count: 0, amount: {} as Record<string, number> },
        open: { count: 0, amount: {} as Record<string, number> },
        cancelled: { count: 0, amount: {} as Record<string, number> },
        monthly: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 })),
    }

    invoices.forEach((inv) => {
        const amount = parseFloat(inv.total.toString())
        const currency = inv.currency
        let category: keyof Omit<typeof report, 'monthly'> | null = null

        if (inv.status === 'PAID') category = 'paid'
        else if (inv.status === 'SENT' || inv.status === 'OVERDUE') category = 'open'
        else if (inv.status === 'CANCELLED') category = 'cancelled'

        if (category) {
            report[category].count++
            report[category].amount[currency] = (report[category].amount[currency] || 0) + amount
        }

        // Monthly breakdown (include PAID, SENT, OVERDUE)
        if (inv.status === 'PAID' || inv.status === 'SENT' || inv.status === 'OVERDUE') {
            const monthIndex = inv.createdAt.getMonth()
            report.monthly[monthIndex].total += amount
        }
    })

    return report
}

const ITEMS_PER_PAGE = 10

export async function getInvoices(
    query: string,
    currentPage: number,
) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { createdAt: 'desc' },
            where: {
                OR: [
                    { invoiceNumber: { contains: query,  } },
                    { company: { name: { contains: query,  } } },
                ],
            },
            include: {
                company: {
                    select: {
                        name: true,
                    },
                },
            },
            take: ITEMS_PER_PAGE,
            skip: offset,
        })

        return invoices
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch invoices.')
    }
}

export async function getInvoicesPages(query: string) {
    try {
        const count = await prisma.invoice.count({
            where: {
                OR: [
                    { invoiceNumber: { contains: query,  } },
                    { company: { name: { contains: query,  } } },
                ],
            },
        })

        const totalPages = Math.ceil(count / ITEMS_PER_PAGE)
        return totalPages
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch total number of invoices.')
    }
}
