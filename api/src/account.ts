import type { Pool } from 'pg'
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
    studyReminderEnabled: Boolean(u.study_reminder_enabled),
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
