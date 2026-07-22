import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const activeOnly = searchParams.get('active') === 'true'

    const products = await prisma.productService.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { code: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkte' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existing = await prisma.productService.findUnique({
      where: { code: validation.data.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ein Produkt mit diesem Code existiert bereits' },
        { status: 400 }
      )
    }

    const product = await prisma.productService.create({
      data: validation.data,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Produkts' },
      { status: 500 }
    )
  }
}
