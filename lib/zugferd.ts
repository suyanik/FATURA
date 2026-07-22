import { PDFDocument, PDFName, AFRelationship } from 'pdf-lib'
import type { InvoicePDFData } from './pdf/invoice-generator'

// ============================================================
// ZUGFeRD 2.x / Factur-X (EN 16931) — E-Rechnung
// Erzeugt ein CII-XML und bettet es als "factur-x.xml" in das PDF ein.
// ============================================================

const esc = (s: string | null | undefined): string =>
  (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const fmtAmount = (n: number): string => n.toFixed(2)

const fmtDate102 = (iso: string): string => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}${m}${day}`
}

/**
 * Erzeugt das Factur-X / ZUGFeRD CII-XML (Profil EN 16931)
 */
export function generateZugferdXml(data: InvoicePDFData): string {
  const s = data.settings
  const currency = data.currency

  // MwSt nach Sätzen gruppieren
  const vatGroups = new Map<number, { base: number; vat: number }>()
  data.items.forEach((item) => {
    const g = vatGroups.get(item.vatRate) || { base: 0, vat: 0 }
    g.base += item.subtotal
    g.vat += item.vatAmount
    vatGroups.set(item.vatRate, g)
  })

  const lineItemsXml = data.items
    .map(
      (item, i) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${i + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${esc(item.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${fmtAmount(item.unitPrice)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">${item.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${item.vatRate === 0 ? 'Z' : 'S'}</ram:CategoryCode>
          <ram:RateApplicablePercent>${fmtAmount(item.vatRate)}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${fmtAmount(item.subtotal)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`
    )
    .join('')

  const taxXml = [...vatGroups.entries()]
    .map(
      ([rate, g]) => `
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${fmtAmount(g.vat)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${fmtAmount(g.base)}</ram:BasisAmount>
        <ram:CategoryCode>${rate === 0 ? 'Z' : 'S'}</ram:CategoryCode>
        <ram:RateApplicablePercent>${fmtAmount(rate)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`
    )
    .join('')

  // Zahlungsart: 58 = SEPA-Überweisung, 10 = Bar, 59 = Lastschrift, 48 = Karte
  const paymentMeansCode =
    data.paymentMethod === 'Bar'
      ? '10'
      : data.paymentMethod === 'Lastschrift'
        ? '59'
        : data.paymentMethod === 'Karte'
          ? '48'
          : '58'

  const iban = (s?.bankIBAN || '').replace(/\s/g, '')

  const paymentMeansXml = `
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>${paymentMeansCode}</ram:TypeCode>${
          iban && paymentMeansCode === '58'
            ? `
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${esc(iban)}</ram:IBANID>${
            s?.bankAccountHolder
              ? `
          <ram:AccountName>${esc(s.bankAccountHolder)}</ram:AccountName>`
              : ''
          }
        </ram:PayeePartyCreditorFinancialAccount>`
            : ''
        }
      </ram:SpecifiedTradeSettlementPaymentMeans>`

  const deliveryDateIso =
    data.serviceDate || data.servicePeriodEnd || data.issueDate

  const billingPeriodXml =
    data.servicePeriodStart && data.servicePeriodEnd
      ? `
      <ram:BillingSpecifiedPeriod>
        <ram:StartDateTime><udt:DateTimeString format="102">${fmtDate102(data.servicePeriodStart)}</udt:DateTimeString></ram:StartDateTime>
        <ram:EndDateTime><udt:DateTimeString format="102">${fmtDate102(data.servicePeriodEnd)}</udt:DateTimeString></ram:EndDateTime>
      </ram:BillingSpecifiedPeriod>`
      : ''

  const paymentTermsXml = `
      <ram:SpecifiedTradePaymentTerms>${
        data.paymentTerms
          ? `
        <ram:Description>${esc(data.paymentTerms)}</ram:Description>`
          : ''
      }${
        data.dueDate
          ? `
        <ram:DueDateDateTime><udt:DateTimeString format="102">${fmtDate102(data.dueDate)}</udt:DateTimeString></ram:DueDateDateTime>`
          : ''
      }
      </ram:SpecifiedTradePaymentTerms>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(data.invoiceNumber)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${fmtDate102(data.issueDate)}</udt:DateTimeString>
    </ram:IssueDateTime>${
      data.notes
        ? `
    <ram:IncludedNote>
      <ram:Content>${esc(data.notes)}</ram:Content>
    </ram:IncludedNote>`
        : ''
    }
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>${lineItemsXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${esc(s?.companyName)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${esc(s?.companyPostalCode)}</ram:PostcodeCode>
          <ram:LineOne>${esc(s?.companyAddress)}</ram:LineOne>
          <ram:CityName>${esc(s?.companyCity)}</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>${
          s?.companyTaxId
            ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="FC">${esc(s.companyTaxId)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
            : ''
        }${
          s?.companyUstIdNr
            ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${esc(s.companyUstIdNr)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
            : ''
        }
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${esc(data.company.name)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${esc(data.company.postalCode)}</ram:PostcodeCode>
          <ram:LineOne>${esc(data.company.address)}</ram:LineOne>
          <ram:CityName>${esc(data.company.city)}</ram:CityName>
          <ram:CountryID>DE</ram:CountryID>
        </ram:PostalTradeAddress>${
          data.company.ustIdNr
            ? `
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${esc(data.company.ustIdNr)}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
            : ''
        }
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${fmtDate102(deliveryDateIso)}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${esc(currency)}</ram:InvoiceCurrencyCode>${paymentMeansXml}${taxXml}${billingPeriodXml}${paymentTermsXml}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${fmtAmount(data.subtotal)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${fmtAmount(data.subtotal)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${esc(currency)}">${fmtAmount(data.totalVat)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${fmtAmount(data.total)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${fmtAmount(data.status === 'PAID' ? 0 : data.total)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`
}

/**
 * XMP-Metadaten für Factur-X
 */
function buildXmpMetadata(data: InvoicePDFData): string {
  const now = new Date().toISOString()
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">Rechnung ${esc(data.invoiceNumber)}</rdf:li></rdf:Alt></dc:title>
      <dc:creator><rdf:Seq><rdf:li>${esc(data.settings?.companyName)}</rdf:li></rdf:Seq></dc:creator>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreatorTool>Yordanova Rechnungssystem</xmp:CreatorTool>
      <xmp:CreateDate>${now}</xmp:CreateDate>
      <xmp:ModifyDate>${now}</xmp:ModifyDate>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

/**
 * Bettet das Factur-X XML als Anhang in das PDF ein (ZUGFeRD-Hybrid)
 */
export async function embedZugferdXml(
  pdfBuffer: Buffer,
  data: InvoicePDFData
): Promise<Buffer> {
  const xml = generateZugferdXml(data)
  const pdfDoc = await PDFDocument.load(pdfBuffer, { updateMetadata: false })

  await pdfDoc.attach(Buffer.from(xml, 'utf-8'), 'factur-x.xml', {
    mimeType: 'text/xml',
    description: 'Factur-X/ZUGFeRD Rechnungsdaten (EN 16931)',
    creationDate: new Date(),
    modificationDate: new Date(),
    afRelationship: AFRelationship.Alternative,
  })

  // XMP-Metadaten setzen
  const xmp = buildXmpMetadata(data)
  const metadataStream = pdfDoc.context.stream(xmp, {
    Type: 'Metadata',
    Subtype: 'XML',
  })
  const metadataRef = pdfDoc.context.register(metadataStream)
  pdfDoc.catalog.set(PDFName.of('Metadata'), metadataRef)

  pdfDoc.setTitle(`Rechnung ${data.invoiceNumber}`)
  pdfDoc.setProducer('Yordanova Rechnungssystem (pdf-lib)')
  pdfDoc.setCreator('Yordanova Rechnungssystem')

  const bytes = await pdfDoc.save({ useObjectStreams: false })
  return Buffer.from(bytes)
}
