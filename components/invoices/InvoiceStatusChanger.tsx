'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { statusLabels, statusColors } from '@/types'
import { ChevronDown, Loader2, Circle } from 'lucide-react'

interface InvoiceStatusChangerProps {
  invoiceId: string
  currentStatus: string
}

const statusOptions = [
  {
    value: 'DRAFT',
    label: 'Entwurf',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dotColor: 'text-gray-500'
  },
  {
    value: 'SENT',
    label: 'Gesendet',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'text-blue-500'
  },
  {
    value: 'PAID',
    label: 'Bezahlt',
    color: 'bg-green-100 text-green-800 border-green-200',
    dotColor: 'text-green-500'
  },
  {
    value: 'CANCELLED',
    label: 'Storniert',
    color: 'bg-red-100 text-red-800 border-red-200',
    dotColor: 'text-red-500'
  },
  {
    value: 'OVERDUE',
    label: 'Überfällig',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    dotColor: 'text-orange-500'
  },
]

export function InvoiceStatusChanger({
  invoiceId,
  currentStatus,
}: InvoiceStatusChangerProps) {
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const currentOption = statusOptions.find((opt) => opt.value === status)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return

    setUpdating(true)

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren des Status')
      }

      setStatus(newStatus)
      toast.success(
        `Status erfolgreich auf "${statusLabels[newStatus as keyof typeof statusLabels]}" geändert`
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Status')
      setStatus(status) // Revert on error
    } finally {
      setUpdating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={updating}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          {updating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Wird aktualisiert...</span>
            </>
          ) : (
            <>
              <Circle className={`h-2 w-2 fill-current ${currentOption?.dotColor}`} />
              <span className={`text-sm font-medium ${currentOption?.color.split(' ')[1]}`}>
                {currentOption?.label || status}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] p-1">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={option.value === status}
            className={`cursor-pointer rounded-md px-3 py-2 ${
              option.value === status ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <Circle className={`h-2 w-2 fill-current ${option.dotColor}`} />
              <span className={`text-sm font-medium ${option.color.split(' ')[1]}`}>
                {option.label}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
