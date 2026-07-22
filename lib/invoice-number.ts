import { prisma } from './prisma'

/**
 * Neue Rechnungsnummer generieren
 * Format: RE-2026-0001
 *
 * Automatische Erhöhung nach Jahr, Zurücksetzen bei Jahreswechsel
 * Atomic Update zur Vermeidung von Duplikaten
 */
export async function generateInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()

  // Einstellungen abrufen oder mit Standardwerten erstellen
  let settings = await prisma.invoiceSettings.findFirst()

  if (!settings) {
    // Einstellungen für erste Rechnung erstellen
    settings = await prisma.invoiceSettings.create({
      data: {
        companyName: 'Firmenname',
        companyTaxId: '0000000000',
        companyTaxOffice: 'Finanzamt',
        companyAddress: 'Adresse',
        currentYear,
        currentCounter: 0,
        invoicePrefix: 'RE',
        invoiceNumberFormat: 'YYYY-NNNN',
      },
    })
  }

  // Counter bei Jahreswechsel zurücksetzen
  if (settings.currentYear !== currentYear) {
    settings = await prisma.invoiceSettings.update({
      where: { id: settings.id },
      data: {
        currentYear,
        currentCounter: 0,
      },
    })
  }

  // Counter erhöhen und neuen Wert abrufen (atomare Operation)
  const updated = await prisma.invoiceSettings.update({
    where: { id: settings.id },
    data: {
      currentCounter: {
        increment: 1,
      },
    },
  })

  // Rechnungsnummer formatieren
  const counter = updated.currentCounter.toString().padStart(4, '0')
  const invoiceNumber = `${settings.invoicePrefix}-${currentYear}-${counter}`

  return invoiceNumber
}

/**
 * Nächste Rechnungsnummer vorschauen (ohne zu speichern)
 */
export async function previewNextInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const settings = await prisma.invoiceSettings.findFirst()

  if (!settings) {
    return `RE-${currentYear}-0001`
  }

  let nextCounter = settings.currentCounter + 1

  // Bei Jahreswechsel beginnt Counter bei 1
  if (settings.currentYear !== currentYear) {
    nextCounter = 1
  }

  const counter = nextCounter.toString().padStart(4, '0')
  return `${settings.invoicePrefix}-${currentYear}-${counter}`
}

/**
 * Zähler mit manuell vergebener Rechnungsnummer synchronisieren.
 * Wenn die Nummer dem Muster PREFIX-JAHR-NNNN entspricht und höher ist
 * als der aktuelle Zähler, wird der Zähler angehoben, damit die
 * automatische Nummerierung keine Duplikate erzeugt.
 */
export async function syncCounterWithManualNumber(
  invoiceNumber: string
): Promise<void> {
  const settings = await prisma.invoiceSettings.findFirst()
  if (!settings) return

  const pattern = new RegExp(
    `^${settings.invoicePrefix}-(\\d{4})-(\\d{1,6})$`
  )
  const match = invoiceNumber.match(pattern)
  if (!match) return

  const year = parseInt(match[1], 10)
  const number = parseInt(match[2], 10)

  if (year === settings.currentYear && number > settings.currentCounter) {
    await prisma.invoiceSettings.update({
      where: { id: settings.id },
      data: { currentCounter: number },
    })
  }
}
