'use client'

import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { PDFDownloadButton } from './PDFDownloadButton'
import { EmailInvoiceButton } from './EmailInvoiceButton'
import { DeleteInvoiceButton } from './DeleteInvoiceButton'

interface InvoiceActionsProps {
  invoiceId: string
  invoiceNumber: string
  status: string
  companyEmail: string | null
}

export function InvoiceActions({
  invoiceId,
  invoiceNumber,
  status,
  companyEmail,
}: InvoiceActionsProps) {
  return (
    <div className="flex gap-2 items-center justify-end">
      {status !== 'PAID' && status !== 'CANCELLED' && (
        <Link href={`/invoices/${invoiceId}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </Link>
      )}
      <PDFDownloadButton
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
      />
      <EmailInvoiceButton
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        defaultEmail={companyEmail}
      />
      <div className="h-6 w-px bg-gray-300 mx-1" />
      <DeleteInvoiceButton
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
      />
    </div>
  )
}
