import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'
import {
  TrendingUp,
  Clock,
  AlertCircle,
  Wallet,
  UserPlus,
  FileText,
  UploadCloud,
  HelpCircle,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { statusLabels, statusColors, Currency } from '@/types'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/data'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { InvoiceCountChart } from '@/components/dashboard/InvoiceCountChart'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const mainCurrency = (stats.totalRevenue && Object.keys(stats.totalRevenue).length > 0
    ? Object.keys(stats.totalRevenue)[0]
    : 'EUR') as Currency
  const totalRevenueAmount = stats.totalRevenue?.[mainCurrency] || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Finanzübersicht</h1>
          <p className="mt-2 text-muted-foreground">
            Willkommen zurück. Das ist der aktuelle Stand Ihres Unternehmens.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button className="gap-1.5">
            <FileText className="h-4 w-4" />
            Neue Rechnung
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gesamtumsatz Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Gesamtumsatz</p>
                <h2 className="text-3xl font-bold mt-2 text-foreground">
                  {formatCurrency(totalRevenueAmount, mainCurrency)}
                </h2>
                <p className="text-primary text-xs font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Bezahlte Rechnungen gesamt
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            {/* Visual Bar Graph Decoration */}
            <div className="mt-6 h-12 w-full flex items-end gap-1 opacity-50">
              <div className="flex-1 bg-primary/20 h-[30%] rounded-sm"></div>
              <div className="flex-1 bg-primary/20 h-[50%] rounded-sm"></div>
              <div className="flex-1 bg-primary/20 h-[40%] rounded-sm"></div>
              <div className="flex-1 bg-primary/20 h-[70%] rounded-sm"></div>
              <div className="flex-1 bg-primary/20 h-[90%] rounded-sm"></div>
              <div className="flex-1 bg-primary/40 h-[60%] rounded-sm"></div>
              <div className="flex-1 bg-primary/60 h-[80%] rounded-sm"></div>
              <div className="flex-1 bg-primary h-[100%] rounded-sm"></div>
            </div>
          </CardContent>
        </Card>

        {/* Ausstehende Zahlungen Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Ausstehende Zahlungen</p>
                <h2 className="text-3xl font-bold mt-2 text-foreground">
                  {stats.pendingInvoiceCount} Rechnungen
                </h2>
                <p className="text-amber-500 text-xs font-semibold mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Warten auf Zahlung
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 h-12 w-full flex items-end gap-1 opacity-50">
              <div className="flex-1 bg-amber-500/20 h-[40%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500/20 h-[30%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500/20 h-[60%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500/20 h-[20%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500/20 h-[50%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500/40 h-[70%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500/60 h-[40%] rounded-sm"></div>
              <div className="flex-1 bg-amber-500 h-[65%] rounded-sm"></div>
            </div>
          </CardContent>
        </Card>

        {/* Überfällige Rechnungen Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Überfällige Rechnungen</p>
                <h2 className="text-3xl font-bold mt-2 text-foreground">
                  {stats.overdueInvoiceCount} Rechnungen
                </h2>
                <p className="text-destructive text-xs font-semibold mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Handeln erforderlich
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 h-12 w-full flex items-end gap-1 opacity-50">
              <div className="flex-1 bg-destructive/20 h-[60%] rounded-sm"></div>
              <div className="flex-1 bg-destructive/20 h-[80%] rounded-sm"></div>
              <div className="flex-1 bg-destructive/20 h-[40%] rounded-sm"></div>
              <div className="flex-1 bg-destructive/20 h-[70%] rounded-sm"></div>
              <div className="flex-1 bg-destructive/20 h-[90%] rounded-sm"></div>
              <div className="flex-1 bg-destructive/40 h-[30%] rounded-sm"></div>
              <div className="flex-1 bg-destructive/60 h-[50%] rounded-sm"></div>
              <div className="flex-1 bg-destructive h-[85%] rounded-sm"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.monthlyData} currency={mainCurrency} />
        <InvoiceCountChart data={stats.monthlyData} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Access Section */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href="/invoices/new" className="flex flex-col items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold">Neue Rechnung</span>
                </Link>
                <Link href="/customers/new" className="flex flex-col items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold">Kunde hinzufügen</span>
                </Link>
                <Link href="/products/new" className="flex flex-col items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold">Neue Leistung</span>
                </Link>
                <Link href="/settings" className="flex flex-col items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold">Einstellungen</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices Table */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Aktuelle Rechnungen</CardTitle>
              <Link href="/invoices" className="text-sm text-primary font-medium hover:underline">
                Alle anzeigen
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentInvoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Es sind noch keine Rechnungen vorhanden
                </p>
              ) : (
                <div className="space-y-1">
                  {/* Table Header (nur Desktop) */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-secondary/30 rounded-t-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-3">Rechnungsnr.</div>
                    <div className="col-span-4">Kunde</div>
                    <div className="col-span-3 text-right">Betrag</div>
                    <div className="col-span-2 text-center">Status</div>
                  </div>

                  {/* Table Body */}
                  {stats.recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex flex-wrap sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-4 items-center hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                    >
                      <div className="w-full sm:w-auto sm:col-span-3 font-semibold text-foreground flex items-center justify-between">
                        <span>{invoice.invoiceNumber}</span>
                        <Badge className={`sm:hidden ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                          {statusLabels[invoice.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <div className="flex-1 sm:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary hidden sm:flex items-center justify-center font-bold text-xs shrink-0">
                          {invoice.companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate text-sm sm:text-base text-muted-foreground sm:text-foreground">{invoice.companyName}</span>
                      </div>
                      <div className="sm:col-span-3 text-right font-medium">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </div>
                      <div className="hidden sm:flex sm:col-span-2 justify-center">
                        <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                          {statusLabels[invoice.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">

          {/* Tax Stats (Existing Component Styled) */}
          <Card className="shadow-md bg-[#0f172a] text-white border-transparent">
            <CardHeader className="pb-4 border-b border-white/10">
              <CardTitle className="text-lg font-bold text-white">Steuerübersicht</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Netto-Umsatz</span>
                  <span className="text-xl font-bold">{formatCurrency(stats.taxStats?.[mainCurrency]?.net || 0, mainCurrency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">MwSt (Gesamt)</span>
                  <span className="text-xl font-bold text-sky-400">{formatCurrency(stats.taxStats?.[mainCurrency]?.tax || 0, mainCurrency)}</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Brutto gesamt</span>
                  <span className="text-2xl font-black">
                    {formatCurrency(stats.taxStats?.[mainCurrency]?.gross || 0, mainCurrency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Reminders (Mocked based on Stitch design but using real overdue count context) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Zahlungserinnerungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.overdueInvoiceCount > 0 ? (
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground">Überfällige Rechnungen</h4>
                      <p className="text-xs text-muted-foreground">{stats.overdueInvoiceCount} Rechnungen erfordern Aufmerksamkeit</p>
                    </div>
                    <Link href="/invoices?status=OVERDUE">
                      <Button size="sm" variant="destructive" className="h-8 text-xs">
                        Ansehen
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-success/20 bg-success/5">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground">Alles im grünen Bereich</h4>
                      <p className="text-xs text-muted-foreground">Keine überfälligen Zahlungen</p>
                    </div>
                  </div>
                )}

                {stats.pendingInvoiceCount > 0 && (
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-secondary/20">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground">Offene Rechnungen</h4>
                      <p className="text-xs text-muted-foreground">{stats.pendingInvoiceCount} Rechnungen warten auf Zahlung</p>
                    </div>
                    <Link href="/invoices?status=SENT">
                      <Button size="sm" variant="outline" className="h-8 text-xs hover:text-primary hover:border-primary">
                        Ansehen
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers (Compact View) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Kunden</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCustomers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Noch keine Daten</p>
              ) : (
                <div className="space-y-4">
                  {stats.topCustomers.slice(0, 3).map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-border">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{customer.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{customer.invoiceCount} Rechnungen</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold">{formatCurrency(customer.totalRevenue, mainCurrency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

