import type { Pool } from 'pg'
import { cancelSubscription, isAsaasConfigured } from './asaas.js'
import { comparePassword, hashPassword } from './auth.js'
import type { UserRow } from './types.js'

export type AccountDto = {
  hasPassword: boolean
  hasGoogle: boolean
  email2faEnabled: boolean
  dailyGoalOverride: number | null
  studyReminderEnabled: boolean
}

export function accountFromUser(u: UserRow): AccountDto {
  return {
    hasPassword: Boolean(u.password_hash),
    hasGoogle: Boolean(u.google_id),
    email2faEnabled: u.email_2fa_enabled ?? true,
    dailyGoalOverride: u.daily_goal_override ?? null,
    studyReminderEnabled: u.study_reminder_enabled !== false,
  }
}

export async function updateUserName(pool: Pool, userId: string, name: string): Promise<UserRow> {
  const trimmed = name.trim()
  if (trimmed.length < 2) throw new Error('Nome deve ter pelo menos 2 caracteres.')
  const { rows } = await pool.query<UserRow>(
    'UPDATE users SET name = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
    [userId, trimmed],
  )
  const user = rows[0]
  if (!user) throw new Error('Usuário não encontrado.')
  return user
}

export async function changePassword(
  pool: Pool,
  user: UserRow,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!user.password_hash) throw new Error('Sua conta usa Google. Defina uma senha na seção abaixo.')
  if (!currentPassword) throw new Error('Informe a senha atual.')
  if (!newPassword || newPassword.length < 6) throw new Error('Nova senha: mínimo 6 caracteres.')
  if (!(await comparePassword(currentPassword, user.password_hash))) {
    throw new Error('Senha atual incorreta.')
  }
  const passwordHash = await hashPassword(newPassword)
  await pool.query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [
    user.id,
    passwordHash,
  ])
}

export async function setPassword(pool: Pool, user: UserRow, newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) throw new Error('Senha: mínimo 6 caracteres.')
  if (user.password_hash) throw new Error('Você já tem senha. Use alterar senha.')
  const passwordHash = await hashPassword(newPassword)
  await pool.query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [
    user.id,
    passwordHash,
  ])
}

export async function updateAccountPrefs(
  pool: Pool,
  userId: string,
  patch: Partial<{
    email2faEnabled: boolean
    dailyGoalOverride: number | null
    studyReminderEnabled: boolean
  }>,
): Promise<UserRow> {
  const sets: string[] = ['updated_at = NOW()']
  const values: unknown[] = [userId]
  let i = 2

  if (patch.email2faEnabled !== undefined) {
    sets.push(`email_2fa_enabled = $${i}`)
    values.push(patch.email2faEnabled)
    i++
  }
  if (patch.dailyGoalOverride !== undefined) {
    if (patch.dailyGoalOverride !== null) {
      const n = patch.dailyGoalOverride
      if (!Number.isInteger(n) || n < 1 || n > 500) {
        throw new Error('Meta diária deve ser entre 1 e 500 questões.')
      }
    }
    sets.push(`daily_goal_override = $${i}`)
    values.push(patch.dailyGoalOverride)
    i++
  }
  if (patch.studyReminderEnabled !== undefined) {
    sets.push(`study_reminder_enabled = $${i}`)
    values.push(patch.studyReminderEnabled)
    i++
  }

  if (sets.length === 1) throw new Error('Nada para atualizar.')

  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    values,
  )
  const user = rows[0]
  if (!user) throw new Error('Usuário não encontrado.')
  return user
}

async function cancelActiveSubscription(pool: Pool, userId: string): Promise<void> {
  const { rows } = await pool.query<{ asaas_subscription_id: string | null; subscription_cancelled_at: Date | null }>(
    `SELECT asaas_subscription_id, subscription_cancelled_at FROM user_billing WHERE user_id = $1`,
    [userId],
  )
  const billing = rows[0]
  if (!billing?.asaas_subscription_id || billing.subscription_cancelled_at) return

  if (isAsaasConfigured()) {
    try {
      await cancelSubscription(billing.asaas_subscription_id)
    } catch (err) {
      console.warn('[account] cancel subscription:', err)
    }
  }

  await pool.query(
    `UPDATE user_billing SET subscription_cancelled_at = NOW(), updated_at = NOW() WHERE user_id = $1`,
    [userId],
  )
}

export async function deleteUserAccount(
  pool: Pool,
  user: UserRow,
  input: { password?: string; confirmEmail?: string },
): Promise<void> {
  const confirmEmail = input.confirmEmail?.trim().toLowerCase()

  if (user.password_hash) {
    if (!input.password) throw new Error('Informe sua senha para excluir a conta.')
    if (!(await comparePassword(input.password, user.password_hash))) {
      throw new Error('Senha incorreta.')
    }
  } else {
    if (!confirmEmail || confirmEmail !== user.email.toLowerCase()) {
      throw new Error('Digite seu e-mail exatamente como cadastrado para confirmar a exclusão.')
    }
  }

  await cancelActiveSubscription(pool, user.id)
  await pool.query('DELETE FROM users WHERE id = $1', [user.id])
}
