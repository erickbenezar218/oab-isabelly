import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

export function generateOtpCode(): string {
  return String(crypto.randomInt(100_000, 1_000_000))
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`
}

export async function createLoginChallenge(userId: string): Promise<{ challengeId: string; code: string }> {
  const code = generateOtpCode()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await pool.query(
    `UPDATE login_challenges SET verified_at = NOW()
     WHERE user_id = $1 AND verified_at IS NULL AND expires_at > NOW()`,
    [userId],
  )

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO login_challenges (user_id, code_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, codeHash, expiresAt],
  )

  return { challengeId: rows[0].id, code }
}

export async function verifyLoginChallenge(
  challengeId: string,
  code: string,
): Promise<{ ok: true; userId: string } | { ok: false; reason: string }> {
  const { rows } = await pool.query<{
    id: string
    user_id: string
    code_hash: string
    expires_at: Date
    attempts: number
    verified_at: Date | null
  }>('SELECT * FROM login_challenges WHERE id = $1', [challengeId])

  const challenge = rows[0]
  if (!challenge) return { ok: false, reason: 'Código inválido ou expirado.' }
  if (challenge.verified_at) return { ok: false, reason: 'Este código já foi usado.' }
  if (challenge.expires_at <= new Date()) return { ok: false, reason: 'Código expirado. Faça login novamente.' }
  if (challenge.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'Muitas tentativas. Faça login novamente.' }

  const valid = await bcrypt.compare(code, challenge.code_hash)
  if (!valid) {
    await pool.query('UPDATE login_challenges SET attempts = attempts + 1 WHERE id = $1', [challengeId])
    return { ok: false, reason: 'Código incorreto.' }
  }

  await pool.query('UPDATE login_challenges SET verified_at = NOW() WHERE id = $1', [challengeId])
  return { ok: true, userId: challenge.user_id }
}
