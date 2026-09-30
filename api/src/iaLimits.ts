import { pool } from './db.js'
import { isPro } from './plans.js'
import type { Plan } from './types.js'

import { FREE_LIMITS } from './freeLimits.js'

const FREE_IA_DAILY = FREE_LIMITS.iaExplicacoesDia

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

async function iaCountToday(userId: string): Promise<number> {
  const { rows } = await pool.query<{ count: number }>(
    'SELECT count FROM ia_daily_usage WHERE user_id = $1 AND usage_date = $2::date',
    [userId, todayKey()],
  )
  return rows[0]?.count ?? 0
}

export async function canGenerateIa(
  userId: string,
  plan: Plan,
  planExpiresAt: Date | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (isPro(plan, planExpiresAt)) return { ok: true }

  const count = await iaCountToday(userId)
  if (count >= FREE_IA_DAILY) {
    return {
      ok: false,
      reason: `Limite diário de ${FREE_IA_DAILY} explicações IA no plano grátis. Assine o Pro para ilimitado.`,
    }
  }
  return { ok: true }
}

export async function recordIaGeneration(userId: string): Promise<void> {
  const key = todayKey()
  await pool.query(
    `INSERT INTO ia_daily_usage (user_id, usage_date, count) VALUES ($1, $2::date, 1)
     ON CONFLICT (user_id, usage_date) DO UPDATE SET count = ia_daily_usage.count + 1`,
    [userId, key],
  )
}

export function iaDailyLimit(plan: Plan, planExpiresAt: Date | null): number | null {
  return isPro(plan, planExpiresAt) ? null : FREE_IA_DAILY
}
