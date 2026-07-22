import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invoiceSettingsSchema } from '@/lib/validators'

export async function GET() {
  try {
    await requireAuth()

    const settings = await prisma.invoiceSettings.findFirst()

    if (!settings) {
      return NextResponse.json(
        { error: 'Einstellungen nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Only admin can update settings
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Für diese Aktion sind Administrator-Rechte erforderlich' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = invoiceSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validation.error.errors },
        { status: 400 }
      )
    }

    const settings = await prisma.invoiceSettings.findFirst()

    if (!settings) {
      return NextResponse.json(
        { error: 'Einstellungen nicht gefunden' },
        { status: 404 }
      )
    }

    const updated = await prisma.invoiceSettings.update({
      where: { id: settings.id },
      data: validation.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update settings error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Einstellungen' },
      { status: 500 }
    )
  }
}
