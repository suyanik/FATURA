'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          background: 'white',
          color: '#111827',
          border: '1px solid #E5E7EB',
        },
      }}
    />
  )
}
