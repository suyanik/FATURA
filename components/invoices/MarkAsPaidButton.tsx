'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface MarkAsPaidButtonProps {
    invoiceId: string
    className?: string
}

export function MarkAsPaidButton({ invoiceId, className }: MarkAsPaidButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleMarkAsPaid = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent parent link navigation
        if (loading) return

        setLoading(true)
        try {
            const response = await fetch(`/api/invoices/${invoiceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PAID' }),
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            router.refresh()
        } catch (error) {
            console.error('Error marking as paid:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className={className}
            onClick={handleMarkAsPaid}
            disabled={loading}
        >
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            {loading ? '...' : 'Bezahlt'}
        </Button>
    )
}
