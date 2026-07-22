import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { formatShortDate } from '@/lib/utils'
import { statusLabels, statusColors } from '@/types'
import { Plus, Eye, Pencil, FileText, Download, Printer } from 'lucide-react'
import { MarkAsPaidButton } from '@/components/invoices/MarkAsPaidButton'
import Link from 'next/link'
import Pagination from '@/components/ui/pagination'
import Search from '@/components/ui/search'
import { getInvoices, getInvoicesPages } from '@/lib/data'

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  const totalPages = await getInvoicesPages(query);
  const invoices = await getInvoices(query, currentPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Rechnungen</h1>
          <p className="mt-2 text-muted-foreground">
            Rechnungen verwalten
          </p>
        </div>
        <Link href="/invoices/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Neue Rechnung
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4">
        <Search placeholder="Rechnungen suchen..." />
      </div>

      {invoices.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Keine Rechnungen gefunden.</p>
              {!query && (
                <Link href="/invoices/new">
                  <Button className="mt-4 bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Erste Rechnung erstellen
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow cursor-pointer border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {invoice.invoiceNumber}
                      </CardTitle>
                      <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{invoice.company.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(invoice.total.toNumber(), invoice.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatShortDate(invoice.issueDate)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-border pt-4 mt-2">
                  <div className="grid grid-cols-3 gap-6 text-sm flex-1">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Zwischensumme</p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(invoice.subtotal.toNumber(), invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">MwSt</p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(invoice.totalVat.toNumber(), invoice.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Fälligkeit</p>
                      <p className="font-medium text-foreground">
                        {invoice.dueDate ? formatShortDate(invoice.dueDate) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:ml-6">
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <Eye className="h-4 w-4 mr-2" />
                        Anzeigen
                      </Button>
                    </Link>
                    <a href={`/api/invoices/${invoice.id}/pdf`} download>
                      <Button variant="outline" size="sm" className="h-8">
                        <Download className="h-4 w-4 mr-2" />
                        PDF Export
                      </Button>
                    </a>
                    <a href={`/api/invoices/${invoice.id}/pdf?inline=true`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8">
                        <Printer className="h-4 w-4 mr-2" />
                        Drucken
                      </Button>
                    </a>
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                      <>
                        <MarkAsPaidButton invoiceId={invoice.id} className="h-8" />
                        <Link href={`/invoices/${invoice.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  )
}
