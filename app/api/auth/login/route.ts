import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, setSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, pin } = validation.data

    // Verify credentials
    const user = await verifyCredentials(email, pin)

    if (!user) {
      return NextResponse.json(
        { error: 'E-Mail oder PIN ist falsch' },
        { status: 401 }
      )
    }

    // Set session
    await setSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Anmelden' },
      { status: 500 }
    )
  }
}
