'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Fehler beim Anmelden')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Verbindungsfehler')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Truck className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Yordanova Transport</h1>
            <p className="text-sm text-slate-400">Rechnungssystem</p>
          </div>
        </div>

        <Card className="w-full shadow-2xl border-transparent">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-bold text-center">
              Anmelden
            </CardTitle>
            <CardDescription className="text-center">
              Bitte melden Sie sich mit Ihren Zugangsdaten an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="beispiel@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">PIN (4-stellig)</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                disabled={loading}
              >
                {loading ? 'Anmeldung läuft...' : 'Anmelden'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
