import crypto from 'node:crypto'
import { pool } from './db.js'
import { hashPassword } from './auth.js'
import { maskEmail } from './otp.js'

const RESET_TTL_MS = 60 * 60 * 1000

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateResetToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MS)

  await pool.query(
    `UPDATE password_reset_tokens SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [userId],
  )

  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  )

  return token
}

export async function validatePasswordResetToken(
  token: string,
): Promise<{ ok: true; userId: string; email: string } | { ok: false; reason: string }> {
  if (!token?.trim()) return { ok: false, reason: 'Link inválido.' }

  const tokenHash = hashToken(token.trim())
  const { rows } = await pool.query<{
    user_id: string
    expires_at: Date
    used_at: Date | null
    email: string
  }>(
    `SELECT t.user_id, t.expires_at, t.used_at, u.email
     FROM password_reset_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = $1`,
    [tokenHash],
  )

  const row = rows[0]
  if (!row) return { ok: false, reason: 'Link inválido ou expirado.' }
  if (row.used_at) return { ok: false, reason: 'Este link já foi usado. Solicite um novo.' }
  if (row.expires_at <= new Date()) return { ok: false, reason: 'Link expirado. Solicite um novo.' }

  return { ok: true, userId: row.user_id, email: maskEmail(row.email) }
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, reason: 'Senha mínima: 6 caracteres.' }
  }

  const check = await validatePasswordResetToken(token)
  if (!check.ok) return check

  const tokenHash = hashToken(token.trim())
  const passwordHash = await hashPassword(newPassword)

  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    passwordHash,
    check.userId,
  ])
  await pool.query(
    `UPDATE password_reset_tokens SET used_at = NOW()
     WHERE token_hash = $1 AND used_at IS NULL`,
    [tokenHash],
  )

  return { ok: true }
}
