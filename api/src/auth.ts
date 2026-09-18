import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import type { JwtPayload, Plan } from './types.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() ?? ''
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID?.trim() ?? ''
const googleAudiences = [GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID].filter(Boolean)
const googleClient = googleAudiences.length ? new OAuth2Client(GOOGLE_CLIENT_ID || GOOGLE_IOS_CLIENT_ID) : null

export function isGoogleConfigured(): boolean {
  return googleAudiences.length > 0
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function verifyGoogleToken(idToken: string): Promise<{ email: string; name: string; sub: string } | null> {
  if (!googleClient || !googleAudiences.length || !idToken?.trim()) return null
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleAudiences,
    })
    const payload = ticket.getPayload()
    if (!payload?.email || !payload.sub) return null
    if (payload.email_verified === false) return null
    return {
      email: payload.email,
      name: payload.name ?? payload.email.split('@')[0],
      sub: payload.sub,
    }
  } catch {
    return null
  }
}

export function effectivePlan(plan: Plan, planExpiresAt: Date | null): Plan {
  if (plan === 'pro' && planExpiresAt && planExpiresAt <= new Date()) return 'free'
  return plan
}
