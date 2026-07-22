import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validators'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const company = await prisma.company.findUnique({
      where: { id },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Get customer error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden des Kunden' },
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

    const validation = companySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check if company exists
    const existing = await prisma.company.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Kunde nicht gefunden' },
        { status: 404 }
      )
    }

    // Check for duplicate taxId (excluding current company)
    if (validation.data.taxId && validation.data.taxId !== existing.taxId) {
      const duplicate = await prisma.company.findFirst({
        where: { taxId: validation.data.taxId, NOT: { id } },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Ein Kunde mit dieser Steuernummer existiert bereits' },
          { status: 400 }
        )
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Update customer error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Kunden' },
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

    // Check if company has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { companyId: id },
    })

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: 'Kunde kann nicht gelöscht werden, da Rechnungen vorhanden sind' },
        { status: 400 }
      )
    }

    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete customer error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Kunden' },
      { status: 500 }
    )
  }
}
