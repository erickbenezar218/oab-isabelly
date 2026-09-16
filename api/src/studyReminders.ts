import { pool } from './db.js'
import { isEmailConfigured } from './email.js'
import { sendStudyReminderEmail } from './emails.js'
import type { UserRow } from './types.js'

const DEFAULT_TZ = 'America/Sao_Paulo'
const DEFAULT_HOUR = 8

function reminderTz() {
  return process.env.STUDY_REMINDER_TZ?.trim() || DEFAULT_TZ
}

function reminderHour() {
  const h = Number(process.env.STUDY_REMINDER_HOUR ?? DEFAULT_HOUR)
  return Number.isFinite(h) ? Math.min(23, Math.max(0, Math.floor(h))) : DEFAULT_HOUR
}

export function isStudyReminderCronEnabled(): boolean {
  if (process.env.STUDY_REMINDER_CRON_ENABLED === 'false') return false
  return isEmailConfigured()
}

export function studyReminderHourLabel(): string {
  const h = reminderHour()
  return `${String(h).padStart(2, '0')}:00`
}

/** Data local (YYYY-MM-DD) no fuso configurado. */
export function todayInReminderTz(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: reminderTz(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function currentHourInReminderTz(date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: reminderTz(),
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '0'
  return Number(hour)
}

export async function runStudyReminderJob(): Promise<{ sent: number; failed: number }> {
  if (!isEmailConfigured()) {
    console.warn('[study-reminder] e-mail não configurado — job ignorado')
    return { sent: 0, failed: 0 }
  }

  const today = todayInReminderTz()
  const { rows } = await pool.query<UserRow>(
    `UPDATE users
     SET study_reminder_last_sent = $1::date,
         updated_at = NOW()
     WHERE study_reminder_enabled = TRUE
       AND (study_reminder_last_sent IS NULL OR study_reminder_last_sent < $1::date)
     RETURNING *`,
    [today],
  )

  let sent = 0
  let failed = 0

  for (const user of rows) {
    try {
      await sendStudyReminderEmail({
        to: user.email,
        name: user.name,
        hourLabel: studyReminderHourLabel(),
      })
      sent++
    } catch (err) {
      failed++
      console.error('[study-reminder] falha ao enviar para', user.email, err)
      await pool.query(
        `UPDATE users SET study_reminder_last_sent = NULL, updated_at = NOW() WHERE id = $1`,
        [user.id],
      )
    }
  }

  if (sent > 0 || failed > 0) {
    console.info(`[study-reminder] concluído: ${sent} enviados, ${failed} falhas (${today})`)
  }

  return { sent, failed }
}

let schedulerStarted = false
let lastSchedulerTick = ''

export function startStudyReminderScheduler(): void {
  if (schedulerStarted || !isStudyReminderCronEnabled()) return
  schedulerStarted = true

  const targetHour = reminderHour()
  const tz = reminderTz()

  const tick = () => {
    const today = todayInReminderTz()
    const hour = currentHourInReminderTz()
    const tickKey = `${today}:${hour}`
    if (hour !== targetHour) return
    if (lastSchedulerTick === tickKey) return
    lastSchedulerTick = tickKey

    runStudyReminderJob().catch((err) => {
      console.error('[study-reminder] erro no job agendado:', err)
      lastSchedulerTick = ''
    })
  }

  console.info(`[study-reminder] cron interno ativo — ${String(targetHour).padStart(2, '0')}:00 ${tz}`)
  tick()
  setInterval(tick, 60_000).unref?.()
}
