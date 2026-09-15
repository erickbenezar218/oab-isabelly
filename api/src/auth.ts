import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import type { JwtPayload, Plan } from './types.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null

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
  if (!googleClient || !process.env.GOOGLE_CLIENT_ID) return null
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  if (!payload?.email || !payload.sub) return null
  return {
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    sub: payload.sub,
  }
}

export function effectivePlan(plan: Plan, planExpiresAt: Date | null): Plan {
  if (plan === 'pro' && planExpiresAt && planExpiresAt <= new Date()) return 'free'
  return plan
}
