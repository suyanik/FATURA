import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validators'
import { generateInvoiceNumber } from '@/lib/invoice-number'
import { calculateInvoiceItem } from '@/lib/invoice-calculator'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const companyId = searchParams.get('companyId')
    const search = searchParams.get('search')

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status ? { status: status as 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED' | 'OVERDUE' } : {}),
        ...(companyId ? { companyId } : {}),
        ...(search
          ? {
              OR: [
                { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
                { company: { name: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {}),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            taxId: true,
            taxOffice: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Get invoices error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der Rechnungen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const validation = invoiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { items, ...invoiceData } = validation.data

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Calculate totals
    let subtotal = 0
    let totalVat = 0

    const calculatedItems = items.map((item, index) => {
      const calc = calculateInvoiceItem(
        item.quantity,
        item.unitPrice,
        item.vatRate
      )

      subtotal += calc.subtotal
      totalVat += calc.vatAmount

      return {
        ...item,
        subtotal: calc.subtotal,
        vatAmount: calc.vatAmount,
        total: calc.total,
        order: index,
      }
    })

    const total = subtotal + totalVat

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        ...invoiceData,
        subtotal,
        totalVat,
        total,
        createdById: user.id,
        items: {
          create: calculatedItems,
        },
      },
      include: {
        items: true,
        company: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Rechnung' },
      { status: 500 }
    )
  }
}
