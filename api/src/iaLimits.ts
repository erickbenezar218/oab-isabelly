import { pool } from './db.js'
import { isPro } from './plans.js'
import type { Plan } from './types.js'

const FREE_IA_DAILY = 20

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export async function canGenerateIa(userId: string, plan: Plan, planExpiresAt: Date | null): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (isPro(plan, planExpiresAt)) return { ok: true }

  const { rows } = await pool.query<{ data: Record<string, unknown> }>(
    'SELECT data FROM user_progress WHERE user_id = $1',
    [userId],
  )
  const data = rows[0]?.data ?? {}
  const usage = data.iaUsageToday as { date?: string; count?: number } | undefined
  const count = usage?.date === todayKey() ? Number(usage.count ?? 0) : 0

  if (count >= FREE_IA_DAILY) {
    return { ok: false, reason: `Limite diário de ${FREE_IA_DAILY} explicações IA no plano grátis. Assine o Pro para ilimitado.` }
  }
  return { ok: true }
}

export async function recordIaGeneration(userId: string): Promise<void> {
  const key = todayKey()
  const { rows } = await pool.query<{ data: Record<string, unknown> }>(
    'SELECT data FROM user_progress WHERE user_id = $1',
    [userId],
  )
  const data = { ...(rows[0]?.data ?? {}) }
  const usage = data.iaUsageToday as { date?: string; count?: number } | undefined
  const count = usage?.date === key ? Number(usage.count ?? 0) + 1 : 1
  data.iaUsageToday = { date: key, count }
  await pool.query(
    `INSERT INTO user_progress (user_id, data, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()`,
    [userId, data],
  )
}

export function iaDailyLimit(plan: Plan, planExpiresAt: Date | null): number | null {
  return isPro(plan, planExpiresAt) ? null : FREE_IA_DAILY
}
