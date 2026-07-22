import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validators'
import { calculateInvoiceItem } from '@/lib/invoice-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            product: true,
          },
        },
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Rechnung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Get invoice error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der Rechnung' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Check if invoice exists
    const existing = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Rechnung nicht gefunden' },
        { status: 404 }
      )
    }

    // If only updating status, handle it separately
    if (body.status && Object.keys(body).length === 1) {
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: { status: body.status },
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
      return NextResponse.json(updatedInvoice)
    }

    // Don't allow editing paid or cancelled invoices
    if (existing.status === 'PAID' || existing.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Bezahlte oder stornierte Rechnungen können nicht bearbeitet werden' },
        { status: 400 }
      )
    }

    const validation = invoiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { items, ...invoiceData } = validation.data

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

    // Update invoice (delete old items and create new ones)
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        subtotal,
        totalVat,
        total,
        items: {
          deleteMany: {},
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Update invoice error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Rechnung' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Rechnung nicht gefunden' },
        { status: 404 }
      )
    }

    // Don't allow deleting paid invoices
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Bezahlte Rechnungen können nicht gelöscht werden' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete invoice error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Rechnung' },
      { status: 500 }
    )
  }
}
