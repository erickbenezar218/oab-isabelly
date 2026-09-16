import type { Plan } from './types.js'
import { pool } from './db.js'

export function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function canUseTutor(plan: Plan, planExpiresAt: Date | null): boolean {
  return isPro(plan, planExpiresAt)
}

export function canUseCronograma(plan: Plan, planExpiresAt: Date | null): boolean {
  return isPro(plan, planExpiresAt)
}

export function isPro(plan: Plan, planExpiresAt: Date | null): boolean {
  if (plan !== 'pro') return false
  if (!planExpiresAt) return true
  return planExpiresAt > new Date()
}

export async function canStartSimulado(userId: string, plan: Plan, planExpiresAt: Date | null): Promise<boolean> {
  if (isPro(plan, planExpiresAt)) return true
  const ym = currentYearMonth()
  const { rows } = await pool.query<{ count: string }>(
    'SELECT count FROM simulado_usage WHERE user_id = $1 AND year_month = $2',
    [userId, ym],
  )
  const count = rows[0] ? Number(rows[0].count) : 0
  return count < 1
}

export async function recordSimuladoUsage(userId: string): Promise<void> {
  const ym = currentYearMonth()
  await pool.query(
    `INSERT INTO simulado_usage (user_id, year_month, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, year_month)
     DO UPDATE SET count = simulado_usage.count + 1`,
    [userId, ym],
  )
}

export function filterProgressForPlan(progress: Record<string, unknown>, pro: boolean) {
  if (pro) return progress
  const simulados = Array.isArray(progress.simulados) ? progress.simulados : []
  return {
    ...progress,
    simulados: simulados.slice(0, 1),
  }
}
