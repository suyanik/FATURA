'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteInvoiceButtonProps {
  invoiceId: string
  invoiceNumber: string
}

export function DeleteInvoiceButton({
  invoiceId,
  invoiceNumber,
}: DeleteInvoiceButtonProps) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen der Rechnung')
      }

      toast.success(`Rechnung ${invoiceNumber} wurde erfolgreich gelöscht`)
      setOpen(false)
      router.push('/invoices')
      router.refresh()
    } catch (error) {
      console.error('Löschfehler:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen der Rechnung')
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Löschen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rechnung löschen?</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie die Rechnung <strong>{invoiceNumber}</strong> löschen möchten?
            <br />
            <br />
            <span className="text-red-600 font-medium">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Wird gelöscht...' : 'Ja, löschen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
