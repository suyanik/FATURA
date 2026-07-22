import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getYearlyReport, getDashboardStats } from '@/lib/data'
import { formatCurrency } from '@/lib/currency'
import {
    Download,
    Calendar,
    ChevronDown,
    TrendingUp,
    Wallet,
    Banknote,
    CheckCircle2
} from 'lucide-react'
import { Currency } from '@/types'
import { Button } from '@/components/ui/button'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default async function ReportsPage() {
    const currentYear = new Date().getFullYear()
    const [report, stats] = await Promise.all([
        getYearlyReport(currentYear),
        getDashboardStats()
    ])

    // Helper to format amount object (e.g., { EUR: 100, USD: 50 })
    const formatAmount = (amountObj: Record<string, number>) => {
        const entries = Object.entries(amountObj)
        if (entries.length === 0) return formatCurrency(0)
        return entries.map(([currency, amount]) => formatCurrency(amount, currency as Currency)).join(' + ')
    }

    // Prepare chart data
    const chartData = report.monthly.map(m => ({
        month: new Date(2000, m.month - 1).toLocaleString('de-DE', { month: 'short' }),
        revenue: m.total
    }))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Berichte & Analysen</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Jahresübersicht {currentYear}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2 hidden sm:flex">
                        <Calendar className="h-4 w-4" />
                        Letzte 12 Monate
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
                        <Download className="h-4 w-4" />
                        Bericht exportieren
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <Card className="rounded-xl shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Banknote className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                                <TrendingUp className="h-3 w-3" />
                                +12.5%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Gesamtumsatz</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{formatAmount(report.paid.amount)}</h3>
                        <p className="text-[11px] text-muted-foreground mt-2">Vergleich zum Vorjahr</p>
                    </CardContent>
                </Card>

                {/* Profit/Paid Card (Using Paid amount as proxy for now) */}
                <Card className="rounded-xl shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                                <TrendingUp className="h-3 w-3" />
                                +8.2%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Bezahlte Beträge</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{formatAmount(report.paid.amount)}</h3>
                        <p className="text-[11px] text-muted-foreground mt-2">Einnahmen in {currentYear}</p>
                    </CardContent>
                </Card>

                {/* Invoices Count Card */}
                <Card className="rounded-xl shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                                Unverändert
                            </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Bezahlte Rechnungen</p>
                        <h3 className="text-2xl font-bold mt-1 text-foreground">{report.paid.count}</h3>
                        <p className="text-[11px] text-muted-foreground mt-2">Abschlussrate: {Math.round((report.paid.count / (report.paid.count + report.open.count + 0.01)) * 100)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <div className="grid gap-6">
                <RevenueChart data={chartData} currency="EUR" />
            </div>

            {/* Top Customers Table */}
            <Card className="rounded-xl shadow-sm overflow-hidden border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground">Top Kunden</h2>
                    <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-medium">Alle ansehen</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kunde</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Rechnungen</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Gesamtumsatz</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stats.topCustomers.map((customer: { name: string; invoiceCount: number; totalRevenue: number }, index: number) => (
                                <tr key={index} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 bg-primary/10 text-primary font-bold text-xs">
                                                <AvatarFallback>{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                                        {customer.invoiceCount}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-foreground">
                                        {formatCurrency(customer.totalRevenue, 'EUR')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Aktiv</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
