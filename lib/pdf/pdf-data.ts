import type { InvoicePDFData } from './invoice-generator'
import type { Invoice, InvoiceItem, Company, InvoiceSettings } from '@prisma/client'

type InvoiceWithRelations = Invoice & {
  company: Company
  items: InvoiceItem[]
  createdBy: { name: string; email: string }
}

/**
 * Baut die Datenstruktur für die PDF-Erzeugung aus Prisma-Objekten
 */
export function buildInvoicePDFData(
  invoice: InvoiceWithRelations,
  settings: InvoiceSettings | null
): InvoicePDFData {
  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate.toISOString(),
    serviceDate: invoice.serviceDate ? invoice.serviceDate.toISOString() : null,
    servicePeriodStart: invoice.servicePeriodStart
      ? invoice.servicePeriodStart.toISOString()
      : null,
    servicePeriodEnd: invoice.servicePeriodEnd
      ? invoice.servicePeriodEnd.toISOString()
      : null,
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    currency: invoice.currency,
    status: invoice.status,
    paymentMethod: invoice.paymentMethod,
    company: {
      name: invoice.company.name,
      customerNumber: invoice.company.customerNumber,
      address: invoice.company.address,
      city: invoice.company.city,
      postalCode: invoice.company.postalCode,
      country: invoice.company.country,
      taxId: invoice.company.taxId,
      ustIdNr: invoice.company.ustIdNr,
      taxOffice: invoice.company.taxOffice,
      email: invoice.company.email,
      phone: invoice.company.phone,
    },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: parseFloat(item.quantity.toString()),
      unit: item.unit,
      unitPrice: parseFloat(item.unitPrice.toString()),
      vatRate: parseFloat(item.vatRate.toString()),
      vatAmount: parseFloat(item.vatAmount.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
      total: parseFloat(item.total.toString()),
    })),
    subtotal: parseFloat(invoice.subtotal.toString()),
    totalVat: parseFloat(invoice.totalVat.toString()),
    total: parseFloat(invoice.total.toString()),
    notes: invoice.notes,
    paymentTerms: invoice.paymentTerms,
    createdBy: {
      name: invoice.createdBy.name,
      email: invoice.createdBy.email,
    },
    createdAt: invoice.createdAt.toISOString(),
    settings: settings
      ? {
          companyName: settings.companyName,
          companyOwner: settings.companyOwner,
          companyAddress: settings.companyAddress,
          companyCity: settings.companyCity,
          companyPostalCode: settings.companyPostalCode,
          companyCountry: settings.companyCountry,
          companyTaxId: settings.companyTaxId,
          companyUstIdNr: settings.companyUstIdNr,
          companyTaxOffice: settings.companyTaxOffice,
          companyEmail: settings.companyEmail,
          companyPhone: settings.companyPhone,
          companyWebsite: settings.companyWebsite,
          companyLogo: settings.companyLogo,
          kleinunternehmer: settings.kleinunternehmer,
          bankName: settings.bankName,
          bankAccountHolder: settings.bankAccountHolder,
          bankIBAN: settings.bankIBAN,
          bankBIC: settings.bankBIC,
        }
      : undefined,
  }
}
