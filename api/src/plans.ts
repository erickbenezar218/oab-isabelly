import type { Plan } from './types.js'
import { pool } from './db.js'
import { FREE_LIMITS, countFlashcardsToday } from './freeLimits.js'

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

export function canUseRevisaoErros(plan: Plan, planExpiresAt: Date | null): boolean {
  return isPro(plan, planExpiresAt)
}

export function canUseDesempenhoCompleto(plan: Plan, planExpiresAt: Date | null): boolean {
  return isPro(plan, planExpiresAt)
}

export function isPro(plan: Plan, planExpiresAt: Date | null): boolean {
  if (plan !== 'pro') return false
  if (!planExpiresAt) return true
  return planExpiresAt > new Date()
}

async function getSimuladoUsage(userId: string, ym: string): Promise<{ full: number; express: number }> {
  const { rows } = await pool.query<{ count: string; express_count: string }>(
    'SELECT count, express_count FROM simulado_usage WHERE user_id = $1 AND year_month = $2',
    [userId, ym],
  )
  const row = rows[0]
  return {
    full: row ? Number(row.count) : 0,
    express: row ? Number(row.express_count ?? 0) : 0,
  }
}

export async function canStartSimulado(
  userId: string,
  plan: Plan,
  planExpiresAt: Date | null,
  mode: 'full' | 'express' = 'full',
): Promise<boolean> {
  if (isPro(plan, planExpiresAt)) return true
  const ym = currentYearMonth()
  const usage = await getSimuladoUsage(userId, ym)
  if (mode === 'express') return usage.express < FREE_LIMITS.simuladosExpressMes
  return usage.full < FREE_LIMITS.simuladosCompletosMes
}

export async function recordSimuladoUsage(userId: string, mode: 'full' | 'express' = 'full'): Promise<void> {
  const ym = currentYearMonth()
  if (mode === 'express') {
    await pool.query(
      `INSERT INTO simulado_usage (user_id, year_month, count, express_count)
       VALUES ($1, $2, 0, 1)
       ON CONFLICT (user_id, year_month)
       DO UPDATE SET express_count = simulado_usage.express_count + 1`,
      [userId, ym],
    )
    return
  }
  await pool.query(
    `INSERT INTO simulado_usage (user_id, year_month, count, express_count)
     VALUES ($1, $2, 1, 0)
     ON CONFLICT (user_id, year_month)
     DO UPDATE SET count = simulado_usage.count + 1`,
    [userId, ym],
  )
}

export function filterProgressForPlan(progress: Record<string, unknown>, pro: boolean) {
  if (pro) return progress
  const simulados = Array.isArray(progress.simulados) ? progress.simulados : []
  const salvos = Array.isArray(progress.salvosRevisao) ? progress.salvosRevisao : []
  return {
    ...progress,
    simulados: simulados.slice(0, 1),
    salvosRevisao: salvos.slice(0, FREE_LIMITS.salvosRevisaoMax),
    customCards: [],
  }
}

/** Corta progresso enviado pelo cliente quando plano grátis. */
export function clampProgressForFreePlan(studyData: Record<string, unknown>): Record<string, unknown> {
  const next = { ...studyData }
  const respostas = Array.isArray(next.respostas) ? [...next.respostas] : []
  const todayCount = countFlashcardsToday(respostas)
  if (todayCount > FREE_LIMITS.flashcardsDia) {
    let kept = 0
    const key = new Date().toISOString().slice(0, 10)
    next.respostas = respostas.filter((r) => {
      const row = r as { modulo?: string; timestamp?: number }
      const isFlashToday =
        row.modulo === 'flashcard' &&
        row.timestamp &&
        new Date(row.timestamp).toISOString().slice(0, 10) === key
      if (!isFlashToday) return true
      kept++
      return kept <= FREE_LIMITS.flashcardsDia
    })
  }
  if (Array.isArray(next.salvosRevisao)) {
    next.salvosRevisao = next.salvosRevisao.slice(0, FREE_LIMITS.salvosRevisaoMax)
  }
  next.customCards = []
  const simulados = Array.isArray(next.simulados) ? next.simulados : []
  next.simulados = simulados.slice(0, 1)
  delete next.iaUsageToday
  return next
}

export async function flashcardsRemainingToday(userId: string, plan: Plan, planExpiresAt: Date | null): Promise<number | null> {
  if (isPro(plan, planExpiresAt)) return null
  const { rows } = await pool.query<{ data: Record<string, unknown> }>(
    'SELECT data FROM user_progress WHERE user_id = $1',
    [userId],
  )
  const respostas = rows[0]?.data?.respostas
  const count = countFlashcardsToday(Array.isArray(respostas) ? respostas : [])
  return Math.max(0, FREE_LIMITS.flashcardsDia - count)
}
