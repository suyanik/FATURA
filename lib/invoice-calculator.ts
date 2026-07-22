export interface InvoiceItemCalculation {
  quantity: number
  unitPrice: number
  vatRate: number
  subtotal: number
  vatAmount: number
  total: number
}

export interface InvoiceTotals {
  subtotal: number
  totalVat: number
  total: number
}

/**
 * Rechnungspositionsberechnungen
 * Menge x Stückpreis = Zwischensumme
 * Zwischensumme x (MwSt-Satz / 100) = MwSt-Betrag
 * Zwischensumme + MwSt-Betrag = Gesamt
 */
export function calculateInvoiceItem(
  quantity: number | string,
  unitPrice: number | string,
  vatRate: number | string
): InvoiceItemCalculation {
  // Convert to numbers for calculation
  const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity
  const price = typeof unitPrice === 'string' ? parseFloat(unitPrice) : unitPrice
  const vat = typeof vatRate === 'string' ? parseFloat(vatRate) : vatRate

  // Calculate subtotal (without VAT)
  const subtotal = Math.round(qty * price * 100) / 100

  // Calculate VAT amount
  const vatAmount = Math.round(subtotal * (vat / 100) * 100) / 100

  // Calculate total (with VAT)
  const total = Math.round((subtotal + vatAmount) * 100) / 100

  return {
    quantity: qty,
    unitPrice: price,
    vatRate: vat,
    subtotal,
    vatAmount,
    total,
  }
}

/**
 * Rechnungssummen berechnen
 * Summiere alle Zwischensummen und MwSt-Beträge der Positionen
 */
export function calculateInvoiceTotals(
  items: Array<{
    quantity: number | string
    unitPrice: number | string
    vatRate: number | string
  }>
): InvoiceTotals {
  let subtotal = 0
  let totalVat = 0

  items.forEach((item) => {
    const calc = calculateInvoiceItem(item.quantity, item.unitPrice, item.vatRate)
    subtotal += calc.subtotal
    totalVat += calc.vatAmount
  })

  // Round to 2 decimal places
  subtotal = Math.round(subtotal * 100) / 100
  totalVat = Math.round(totalVat * 100) / 100
  const total = Math.round((subtotal + totalVat) * 100) / 100

  return {
    subtotal,
    totalVat,
    total,
  }
}

/**
 * MwSt-Sätze (Deutschland)
 */
export const VAT_RATES = [
  { value: 0, label: '0%' },
  { value: 7, label: '7% (ermäßigt)' },
  { value: 19, label: '19% (Regelsteuersatz)' },
] as const

export const DEFAULT_VAT_RATE = 19
