import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { previewNextInvoiceNumber } from '@/lib/invoice-number'

export async function GET() {
  try {
    await requireAuth()

    const nextNumber = await previewNextInvoiceNumber()

    return NextResponse.json({ invoiceNumber: nextNumber })
  } catch (error) {
    console.error('Preview invoice number error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Fehler bei der Rechnungsnummernvorschau' },
      { status: 500 }
    )
  }
}
