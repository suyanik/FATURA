'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface PDFDownloadButtonProps {
  invoiceId: string
  invoiceNumber: string
}

export function PDFDownloadButton({
  invoiceId,
  invoiceNumber,
}: PDFDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)

      if (!response.ok) {
        throw new Error('PDF-Download fehlgeschlagen')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF-Download-Fehler:', error)
      alert('Fehler beim Herunterladen des PDFs')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
      <Download className="h-4 w-4 mr-2" />
      {isDownloading ? 'Wird heruntergeladen...' : 'PDF herunterladen'}
    </Button>
  )
}
