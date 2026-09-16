import { pool } from './db.js'
import { sendProAccessEmail } from './emails.js'
import type { UserRow } from './types.js'

/** Ativa plano Pro e envia e-mail de acesso (usado por webhook Asaas no futuro). */
export async function activateProPlan(
  userId: string,
  expiresAt: Date | null,
  opts?: { passwordHint?: string },
): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET plan = 'pro', plan_expires_at = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId, expiresAt],
  )
  const user = rows[0]
  if (!user) return null

  sendProAccessEmail({
    to: user.email,
    name: user.name,
    expiresAt,
    passwordHint: opts?.passwordHint,
  })

  return user
}
