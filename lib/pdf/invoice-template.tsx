import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { InvoicePDFData } from './invoice-generator'

// ============================================================
// Professionelle deutsche Rechnung (angelehnt an DIN 5008)
// ============================================================

const ACCENT = '#0f172a'
const PRIMARY = '#137fec'
const GRAY = '#64748b'
const LIGHT = '#e2e8f0'

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 50,
    paddingBottom: 110,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },

  // Kopfbereich
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 55,
    objectFit: 'contain',
  },
  companyBlock: {
    textAlign: 'right',
    fontSize: 8.5,
    lineHeight: 1.5,
    color: GRAY,
  },
  companyNameHeader: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 2,
  },

  // Adressfenster + Infoblock
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  addressWindow: {
    width: '55%',
  },
  senderLine: {
    fontSize: 6.5,
    color: GRAY,
    textDecoration: 'underline',
    marginBottom: 8,
  },
  recipient: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  recipientName: {
    fontFamily: 'Helvetica-Bold',
  },
  infoBlock: {
    width: '38%',
    fontSize: 9,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
    borderBottom: `0.5px solid ${LIGHT}`,
  },
  infoLabel: {
    color: GRAY,
  },
  infoValue: {
    fontFamily: 'Helvetica-Bold',
  },

  // Titel
  title: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 4,
  },
  intro: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 14,
  },

  // Tabelle
  table: {
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `0.5px solid ${LIGHT}`,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  colPos: { width: '5%' },
  colDesc: { width: '39%' },
  colQty: { width: '9%', textAlign: 'right' },
  colUnit: { width: '11%', textAlign: 'right' },
  colPrice: { width: '14%', textAlign: 'right' },
  colVat: { width: '8%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },

  // Summen
  sumBlock: {
    marginLeft: 'auto',
    width: 230,
    marginBottom: 18,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3.5,
  },
  sumDivider: {
    borderBottom: `0.5px solid ${LIGHT}`,
  },
  sumTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },

  // Hinweise
  block: {
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
    color: ACCENT,
  },
  blockText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#334155',
  },
  legalNote: {
    fontSize: 8.5,
    color: GRAY,
    fontStyle: 'italic' as const,
    marginBottom: 12,
  },

  // Fußzeile
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 50,
    right: 50,
    borderTop: `1px solid ${LIGHT}`,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: GRAY,
    lineHeight: 1.6,
  },
  footerCol: {
    width: '32%',
  },
  footerTitle: {
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginBottom: 1,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 7,
    color: GRAY,
  },
})

const fmtMoney = (amount: number, currency: string): string => {
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  const symbols: Record<string, string> = { EUR: '€', USD: '$', TRY: '₺' }
  return `${formatted} ${symbols[currency] || currency}`
}

const fmtQty = (n: number): string =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(n)

const fmtDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const InvoicePDFTemplate: React.FC<{ data: InvoicePDFData }> = ({
  data,
}) => {
  const s = data.settings

  // Absenderzeile (einzeilig, klein, über Adressfenster)
  const senderParts = [
    s?.companyName,
    s?.companyAddress,
    [s?.companyPostalCode, s?.companyCity].filter(Boolean).join(' '),
  ].filter(Boolean)
  const senderLine = senderParts.join(' · ')

  // MwSt nach Sätzen gruppieren
  const vatGroups = new Map<number, { base: number; vat: number }>()
  data.items.forEach((item) => {
    const g = vatGroups.get(item.vatRate) || { base: 0, vat: 0 }
    g.base += item.subtotal
    g.vat += item.vatAmount
    vatGroups.set(item.vatRate, g)
  })
  const sortedVatRates = [...vatGroups.entries()].sort((a, b) => a[0] - b[0])

  // Zahlungshinweis
  const isPaid = data.status === 'PAID'
  const isCash = data.paymentMethod === 'Bar'
  let paymentNote = ''
  if (isCash && isPaid) {
    paymentNote = 'Der Rechnungsbetrag wurde bereits in bar beglichen.'
  } else if (isPaid) {
    paymentNote = 'Der Rechnungsbetrag wurde bereits beglichen. Vielen Dank.'
  } else if (data.dueDate && s?.bankIBAN) {
    paymentNote = `Bitte überweisen Sie den Rechnungsbetrag bis zum ${fmtDate(
      data.dueDate
    )} unter Angabe der Rechnungsnummer auf das unten genannte Konto.`
  } else if (data.dueDate) {
    paymentNote = `Zahlbar bis zum ${fmtDate(data.dueDate)}.`
  }

  return (
    <Document
      title={`Rechnung ${data.invoiceNumber}`}
      author={s?.companyName || 'Rechnungssystem'}
      subject={`Rechnung ${data.invoiceNumber}`}
      creator="Yordanova Rechnungssystem"
    >
      <Page size="A4" style={styles.page}>
        {/* Kopfzeile: Logo links, Firmendaten rechts */}
        <View style={styles.headerRow} fixed>
          <View>
            {s?.companyLogo ? (
              <Image src={s.companyLogo} style={styles.logo} />
            ) : (
              <Text style={styles.companyNameHeader}>{s?.companyName}</Text>
            )}
          </View>
          <View style={styles.companyBlock}>
            <Text style={styles.companyNameHeader}>{s?.companyName}</Text>
            {s?.companyOwner ? <Text>Inh. {s.companyOwner}</Text> : null}
            {s?.companyAddress ? <Text>{s.companyAddress}</Text> : null}
            {(s?.companyPostalCode || s?.companyCity) ? (
              <Text>
                {[s?.companyPostalCode, s?.companyCity].filter(Boolean).join(' ')}
              </Text>
            ) : null}
            {s?.companyPhone ? <Text>Tel: {s.companyPhone}</Text> : null}
            {s?.companyEmail ? <Text>{s.companyEmail}</Text> : null}
          </View>
        </View>

        {/* Adressfenster + Rechnungs-Infoblock */}
        <View style={styles.addressRow}>
          <View style={styles.addressWindow}>
            {senderLine ? (
              <Text style={styles.senderLine}>{senderLine}</Text>
            ) : null}
            <View style={styles.recipient}>
              <Text style={styles.recipientName}>{data.company.name}</Text>
              <Text>{data.company.address}</Text>
              {(data.company.postalCode || data.company.city) ? (
                <Text>
                  {[data.company.postalCode, data.company.city]
                    .filter(Boolean)
                    .join(' ')}
                </Text>
              ) : null}
              {data.company.country && data.company.country !== 'Deutschland' ? (
                <Text>{data.company.country}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rechnungsnr.</Text>
              <Text style={styles.infoValue}>{data.invoiceNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rechnungsdatum</Text>
              <Text style={styles.infoValue}>{fmtDate(data.issueDate)}</Text>
            </View>
            {data.serviceDate ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Leistungsdatum</Text>
                <Text style={styles.infoValue}>{fmtDate(data.serviceDate)}</Text>
              </View>
            ) : null}
            {data.servicePeriodStart && data.servicePeriodEnd ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Leistungszeitraum</Text>
                <Text style={styles.infoValue}>
                  {fmtDate(data.servicePeriodStart)} – {fmtDate(data.servicePeriodEnd)}
                </Text>
              </View>
            ) : null}
            {!data.serviceDate && !data.servicePeriodStart ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Leistungsdatum</Text>
                <Text style={styles.infoValue}>
                  entspr. Rechnungsdatum
                </Text>
              </View>
            ) : null}
            {data.dueDate ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fällig am</Text>
                <Text style={styles.infoValue}>{fmtDate(data.dueDate)}</Text>
              </View>
            ) : null}
            {data.company.customerNumber ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kundennr.</Text>
                <Text style={styles.infoValue}>{data.company.customerNumber}</Text>
              </View>
            ) : null}
            {data.company.ustIdNr ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>USt-IdNr. Kunde</Text>
                <Text style={styles.infoValue}>{data.company.ustIdNr}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Titel */}
        <Text style={styles.title}>Rechnung Nr. {data.invoiceNumber}</Text>
        <Text style={styles.intro}>
          Sehr geehrte Damen und Herren, wir berechnen Ihnen die folgenden
          Leistungen:
        </Text>

        {/* Positionstabelle */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.colPos}>Pos.</Text>
            <Text style={styles.colDesc}>Beschreibung</Text>
            <Text style={styles.colQty}>Menge</Text>
            <Text style={styles.colUnit}>Einheit</Text>
            <Text style={styles.colPrice}>Einzelpreis</Text>
            <Text style={styles.colVat}>MwSt</Text>
            <Text style={styles.colTotal}>Gesamt (netto)</Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.colPos}>{index + 1}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{fmtQty(item.quantity)}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colPrice}>
                {fmtMoney(item.unitPrice, data.currency)}
              </Text>
              <Text style={styles.colVat}>{fmtQty(item.vatRate)}%</Text>
              <Text style={styles.colTotal}>
                {fmtMoney(item.subtotal, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summen */}
        <View style={styles.sumBlock} wrap={false}>
          <View style={[styles.sumRow, styles.sumDivider]}>
            <Text>Zwischensumme (netto)</Text>
            <Text>{fmtMoney(data.subtotal, data.currency)}</Text>
          </View>
          {sortedVatRates.map(([rate, g]) => (
            <View key={rate} style={[styles.sumRow, styles.sumDivider]}>
              <Text>
                zzgl. {fmtQty(rate)}% MwSt auf {fmtMoney(g.base, data.currency)}
              </Text>
              <Text>{fmtMoney(g.vat, data.currency)}</Text>
            </View>
          ))}
          <View style={styles.sumTotal}>
            <Text>Rechnungsbetrag</Text>
            <Text style={{ color: PRIMARY }}>
              {fmtMoney(data.total, data.currency)}
            </Text>
          </View>
        </View>

        {/* Kleinunternehmer-Hinweis */}
        {s?.kleinunternehmer ? (
          <Text style={styles.legalNote}>
            Gemäß § 19 UStG wird keine Umsatzsteuer berechnet
            (Kleinunternehmerregelung).
          </Text>
        ) : null}

        {/* Zahlungshinweis */}
        {paymentNote ? (
          <View style={styles.block} wrap={false}>
            <Text style={styles.blockTitle}>Zahlung</Text>
            <Text style={styles.blockText}>{paymentNote}</Text>
          </View>
        ) : null}

        {/* Zahlungsbedingungen */}
        {data.paymentTerms ? (
          <View style={styles.block} wrap={false}>
            <Text style={styles.blockTitle}>Zahlungsbedingungen</Text>
            <Text style={styles.blockText}>{data.paymentTerms}</Text>
          </View>
        ) : null}

        {/* Notizen */}
        {data.notes ? (
          <View style={styles.block} wrap={false}>
            <Text style={styles.blockTitle}>Hinweise</Text>
            <Text style={styles.blockText}>{data.notes}</Text>
          </View>
        ) : null}

        <Text style={[styles.blockText, { marginTop: 6 }]}>
          Vielen Dank für Ihren Auftrag!
        </Text>

        {/* Fußzeile mit Pflichtangaben */}
        <View style={styles.footer} fixed>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>{s?.companyName}</Text>
            {s?.companyOwner ? <Text>Inh. {s.companyOwner}</Text> : null}
            <Text>{s?.companyAddress}</Text>
            <Text>
              {[s?.companyPostalCode, s?.companyCity].filter(Boolean).join(' ')}
            </Text>
            {s?.companyPhone ? <Text>Tel: {s.companyPhone}</Text> : null}
            {s?.companyEmail ? <Text>{s.companyEmail}</Text> : null}
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Steuerangaben</Text>
            {s?.companyTaxId ? <Text>Steuernr.: {s.companyTaxId}</Text> : null}
            {s?.companyUstIdNr ? <Text>USt-IdNr.: {s.companyUstIdNr}</Text> : null}
            {s?.companyTaxOffice ? (
              <Text>Finanzamt: {s.companyTaxOffice}</Text>
            ) : null}
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Bankverbindung</Text>
            {s?.bankAccountHolder ? (
              <Text>Kontoinhaber: {s.bankAccountHolder}</Text>
            ) : null}
            {s?.bankIBAN ? <Text>IBAN: {s.bankIBAN}</Text> : null}
            {s?.bankBIC ? <Text>BIC: {s.bankBIC}</Text> : null}
            {s?.bankName ? <Text>{s.bankName}</Text> : null}
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Seite ${pageNumber} von ${totalPages} · Rechnung ${data.invoiceNumber}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
