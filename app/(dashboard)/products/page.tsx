import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/currency'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function ProductsPage() {
  const products = await prisma.productService.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produkte und Dienstleistungen</h1>
          <p className="mt-2 text-gray-600">
            Gesamt {products.length} Produkte/Dienstleistungen
          </p>
        </div>
        <Link href="/products/new">
          <Button className="bg-brand hover:bg-brand/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Neues Produkt/Dienstleistung
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-600">Es sind noch keine Produkte/Dienstleistungen vorhanden</p>
              <Link href="/products/new">
                <Button className="mt-4 bg-brand hover:bg-brand/90 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Erstes Produkt hinzufügen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={product.isActive ? 'default' : 'secondary'}
                        className={
                          product.isActive
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {product.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {product.code}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-baseline justify-between border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          product.defaultPrice.toNumber(),
                          product.currency
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        pro {product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">MwSt</p>
                      <p className="text-sm font-medium">
                        %{product.defaultVatRate.toNumber()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </Button>
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        const { revalidatePath } = await import('next/cache')

                        try {
                          // Check if product exists before deleting
                          const exists = await prisma.productService.findUnique({
                            where: { id: product.id },
                          })

                          if (exists) {
                            await prisma.productService.delete({
                              where: { id: product.id },
                            })
                          }

                          revalidatePath('/products')
                        } catch (error) {
                          console.error('Delete product error:', error)
                          throw error
                        }
                      }}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
