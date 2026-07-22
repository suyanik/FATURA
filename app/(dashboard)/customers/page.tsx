import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  History,
  FilePlus,
  Trash2,
  Wallet,
  CheckCircle,
  UserPlus,
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/currency'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default async function CustomersPage() {
  const customers = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invoices: {
        select: {
          total: true,
          status: true,
        }
      },
    },
  })

  // Calculate stats
  const totalOutstanding = customers.reduce((acc, customer) => {
    const outstanding = customer.invoices
      .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + Number(inv.total), 0)
    return acc + outstanding
  }, 0)

  const activeCustomersCount = customers.filter(c => c.invoices.length > 0).length
  const newCustomersCount = customers.filter(c => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(c.createdAt) > thirtyDaysAgo
  }).length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Kundenliste</h1>
          <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihre Kundenkontakte und Zahlungsstände.</p>
        </div>
        <Link href="/customers/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" />
            Neuer Kunde
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-xl shadow-sm border-border">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="Kunden suchen..."
              className="pl-10 bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2 w-full md:w-auto text-muted-foreground hover:text-foreground">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2 w-full md:w-auto text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Table Content */}
      <Card className="rounded-xl shadow-sm overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Unternehmen</th>
                <th className="px-6 py-4">Kontakt</th>
                <th className="px-6 py-4 text-right">Offener Betrag</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Keine Kunden gefunden.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const openAmount = customer.invoices
                    .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
                    .reduce((sum, inv) => sum + Number(inv.total), 0)

                  const initials = customer.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <tr key={customer.id} className="group hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-primary/10 text-primary font-bold">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <Link href={`/customers/${customer.id}/edit`} className="font-semibold text-foreground hover:text-primary transition-colors">
                            {customer.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          {customer.taxOffice || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground whitespace-nowrap">
                        {formatCurrency(openAmount, 'EUR')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={openAmount > 0 ? "outline" : "secondary"} className={openAmount > 0 ? "text-amber-600 border-amber-200 bg-amber-50" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"}>
                          {openAmount > 0 ? 'Offen' : 'Ausgeglichen'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <History className="h-4 w-4" />
                          </Button>
                          <Link href={`/invoices/new?customerId=${customer.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <FilePlus className="h-4 w-4" />
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/customers/${customer.id}/edit`}>
                                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <form
                                  action={async () => {
                                    'use server'
                                    const { revalidatePath } = await import('next/cache')
                                    try {
                                      const exists = await prisma.company.findUnique({
                                        where: { id: customer.id },
                                      })
                                      if (exists) {
                                        await prisma.company.delete({
                                          where: { id: customer.id },
                                        })
                                      }
                                      revalidatePath('/customers')
                                    } catch (error) {
                                      console.error('Delete customer error:', error)
                                    }
                                  }}
                                  className="w-full"
                                >
                                  <button type="submit" className="w-full text-left">Löschen</button>
                                </form>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Visual Only for now) */}
        <div className="px-6 py-4 bg-secondary/20 flex items-center justify-between border-t border-border">
          <div className="text-xs text-muted-foreground">
            Zeige <span className="font-semibold text-foreground">1</span> bis <span className="font-semibold text-foreground">{Math.min(5, customers.length)}</span> von <span className="font-semibold text-foreground">{customers.length}</span> Kunden
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-8 w-8 bg-primary text-primary-foreground text-xs font-bold">1</Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-background" disabled>2</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Gesamte Außenstände</span>
              <Wallet className="h-5 w-5 text-primary/40" />
            </div>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalOutstanding, 'EUR')}</div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -4.2% seit letztem Monat
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Aktive Kunden</span>
              <CheckCircle className="h-5 w-5 text-emerald-500/40" />
            </div>
            <div className="text-2xl font-bold text-foreground">{activeCustomersCount}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {customers.length > 0 ? Math.round((activeCustomersCount / customers.length) * 100) : 0}% Ihrer Kunden sind aktiv
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Neue Kunden (30 Tage)</span>
              <UserPlus className="h-5 w-5 text-blue-500/40" />
            </div>
            <div className="text-2xl font-bold text-foreground">{newCustomersCount}</div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% Zuwachs
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
