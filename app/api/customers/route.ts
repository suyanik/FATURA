import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const companies = await prisma.company.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { taxId: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Get customers error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kunden' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validation = companySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check for duplicate taxId (falls angegeben)
    if (validation.data.taxId) {
      const existing = await prisma.company.findFirst({
        where: { taxId: validation.data.taxId },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ein Kunde mit dieser Steuernummer existiert bereits' },
          { status: 400 }
        )
      }
    }

    const company = await prisma.company.create({
      data: validation.data,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Kunden' },
      { status: 500 }
    )
  }
}
