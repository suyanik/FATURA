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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

interface EmailInvoiceButtonProps {
  invoiceId: string
  invoiceNumber: string
  defaultEmail?: string | null
}

export function EmailInvoiceButton({
  invoiceId,
  invoiceNumber,
  defaultEmail,
}: EmailInvoiceButtonProps) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState(defaultEmail || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    if (!email) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein')
      return
    }

    setSending(true)

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: email,
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Senden der E-Mail')
      }

      toast.success('E-Mail erfolgreich gesendet!')
      setOpen(false)
      setEmail(defaultEmail || '')
      setSubject('')
      setMessage('')
    } catch (error) {
      console.error('E-Mail-Fehler:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden der E-Mail')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Per E-Mail senden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rechnung per E-Mail senden</DialogTitle>
          <DialogDescription>
            Senden Sie die Rechnung {invoiceNumber} als PDF-Anhang per E-Mail
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">
              Empfänger E-Mail <span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="kunde@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Betreff (Optional)</Label>
            <Input
              id="subject"
              placeholder="Rechnung {invoiceNumber}"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leer lassen für Standardbetreff
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Nachricht (Optional)</Label>
            <textarea
              id="message"
              rows={5}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              placeholder="Ihre persönliche Nachricht..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leer lassen für Standardnachricht
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending || !email}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sending ? 'Wird gesendet...' : 'E-Mail senden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
