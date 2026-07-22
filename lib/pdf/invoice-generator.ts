import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDFTemplate } from './invoice-template'

export interface InvoicePDFData {
  invoiceNumber: string
  issueDate: string
  serviceDate: string | null
  servicePeriodStart: string | null
  servicePeriodEnd: string | null
  dueDate: string | null
  currency: string
  status?: string
  paymentMethod: string | null
  company: {
    name: string
    customerNumber: string | null
    address: string
    city: string | null
    postalCode: string | null
    country: string | null
    taxId: string | null
    ustIdNr: string | null
    taxOffice: string | null
    email: string | null
    phone: string | null
  }
  items: Array<{
    description: string
    quantity: number
    unit: string
    unitPrice: number
    vatRate: number
    vatAmount: number
    subtotal: number
    total: number
  }>
  subtotal: number
  totalVat: number
  total: number
  notes: string | null
  paymentTerms: string | null
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
  settings?: {
    companyName: string | null
    companyOwner: string | null
    companyAddress: string | null
    companyCity: string | null
    companyPostalCode: string | null
    companyCountry: string | null
    companyTaxId: string | null
    companyUstIdNr: string | null
    companyTaxOffice: string | null
    companyEmail: string | null
    companyPhone: string | null
    companyWebsite: string | null
    companyLogo: string | null
    kleinunternehmer: boolean
    bankName: string | null
    bankAccountHolder: string | null
    bankIBAN: string | null
    bankBIC: string | null
  }
}

/**
 * Generiert ein PDF aus Rechnungsdaten
 */
export async function generateInvoicePDF(
  data: InvoicePDFData
): Promise<NodeJS.ReadableStream> {
  // @ts-expect-error - React PDF types don't match exactly
  const stream = await renderToStream(InvoicePDFTemplate({ data }))
  return stream as unknown as NodeJS.ReadableStream
}

/**
 * Konvertiert einen Stream in einen Buffer
 */
export async function streamToBuffer(
  stream: NodeJS.ReadableStream
): Promise<Buffer> {
  const chunks: Uint8Array[] = []

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}
