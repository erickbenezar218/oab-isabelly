import type { Pool } from 'pg'
import type { UserRow } from './types.js'

export type UserProfileDto = {
  examDate: string | null
  area2fase: string
  onboardingDone: boolean
  welcomeTourDone: boolean
}

export type ProfilePatch = Partial<{
  examDate: string | null
  area2fase: string
  onboardingDone: boolean
  welcomeTourDone: boolean
}>

function toIsoDate(d: Date | string | null | undefined): string | null {
  if (!d) return null
  if (typeof d === 'string') return d.slice(0, 10)
  return d.toISOString().slice(0, 10)
}

export function profileFromUser(u: UserRow): UserProfileDto {
  return {
    examDate: toIsoDate(u.exam_date),
    area2fase: u.area_2fase ?? 'Trabalhista',
    onboardingDone: Boolean(u.onboarding_done),
    welcomeTourDone: Boolean(u.welcome_tour_done),
  }
}

function isValidExamDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

export function validateProfilePatch(patch: ProfilePatch, current?: UserProfileDto): string | null {
  if (patch.examDate !== undefined && patch.examDate !== null) {
    if (!isValidExamDate(patch.examDate)) return 'Data da prova inválida.'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(patch.examDate + 'T12:00:00')
    if (exam < today) return 'A data da prova deve ser hoje ou no futuro.'
  }
  if (patch.onboardingDone === true) {
    const exam = patch.examDate !== undefined ? patch.examDate : (current?.examDate ?? null)
    if (!exam) return 'Informe a data da prova para concluir o cadastro.'
  }
  return null
}

export async function migrateProfileFromProgressJson(
  pool: Pool,
  user: UserRow,
  progressData: Record<string, unknown>,
): Promise<UserRow> {
  if (user.exam_date && user.onboarding_done) return user

  const legacy = progressData.profile as Record<string, unknown> | undefined
  if (!legacy) return user

  const examDate = typeof legacy.examDate === 'string' ? legacy.examDate.slice(0, 10) : null
  const area2fase = typeof legacy.area2fase === 'string' ? legacy.area2fase : null
  const onboardingDone = legacy.onboardingDone === true
  const welcomeTourDone = legacy.welcomeTourDone === true

  if (!examDate && !onboardingDone && !welcomeTourDone && !area2fase) return user

  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET
      exam_date = COALESCE(exam_date, $2::date),
      area_2fase = COALESCE(area_2fase, $3),
      onboarding_done = onboarding_done OR $4,
      welcome_tour_done = welcome_tour_done OR $5,
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [user.id, examDate, area2fase ?? 'Trabalhista', onboardingDone, welcomeTourDone],
  )
  return rows[0] ?? user
}

export async function updateUserProfile(
  pool: Pool,
  userId: string,
  patch: ProfilePatch,
  current?: UserProfileDto,
): Promise<UserRow> {
  const err = validateProfilePatch(patch, current)
  if (err) throw new Error(err)

  const sets: string[] = ['updated_at = NOW()']
  const values: unknown[] = [userId]
  let i = 2

  if (patch.examDate !== undefined) {
    sets.push(`exam_date = $${i}::date`)
    values.push(patch.examDate)
    i++
  }
  if (patch.area2fase !== undefined) {
    sets.push(`area_2fase = $${i}`)
    values.push(patch.area2fase)
    i++
  }
  if (patch.onboardingDone !== undefined) {
    sets.push(`onboarding_done = $${i}`)
    values.push(patch.onboardingDone)
    i++
  }
  if (patch.welcomeTourDone !== undefined) {
    sets.push(`welcome_tour_done = $${i}`)
    values.push(patch.welcomeTourDone)
    i++
  }

  if (sets.length === 1) throw new Error('Nada para atualizar.')

  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    values,
  )
  const user = rows[0]
  if (!user) throw new Error('Usuário não encontrado.')
  if (patch.onboardingDone && !user.exam_date) {
    throw new Error('Informe a data da prova para concluir o cadastro.')
  }
  return user
}
