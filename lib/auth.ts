import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE_NAME = 'invoice-session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 Tage in Sekunden

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET ist nicht (sicher) gesetzt')
  }
  return secret
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

/**
 * Signiertes Session-Token erstellen: userId.expiresAt.signature
 */
function createToken(userId: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000
  const payload = `${userId}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

/**
 * Token verifizieren, gibt userId zurück oder null
 */
function verifyToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [userId, expiresAt, signature] = parts
  const payload = `${userId}.${expiresAt}`
  const expected = sign(payload)

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  if (Date.now() > parseInt(expiresAt, 10)) {
    return null
  }

  return userId
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'STAFF'
}

/**
 * Aktuellen Session-Benutzer abrufen
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const userId = verifyToken(sessionCookie.value)
    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

/**
 * Authentifizierung erforderlich - wirft Fehler wenn nicht angemeldet
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * Admin-Rolle erforderlich
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden - Admin access required')
  }

  return user
}

/**
 * Session-Cookie setzen (signiertes Token)
 */
export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: createToken(userId),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Session-Cookie löschen
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Anmeldedaten prüfen
 */
export async function verifyCredentials(
  email: string,
  pin: string
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      pin: true,
    },
  })

  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(pin, user.pin)

  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

/**
 * PIN hashen
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10)
}
