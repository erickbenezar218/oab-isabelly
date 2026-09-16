export type Plan = 'free' | 'pro'

export interface UserRow {
  id: string
  email: string
  name: string
  password_hash: string | null
  google_id: string | null
  plan: Plan
  plan_expires_at: Date | null
  asaas_customer_id: string | null
  cpf_cnpj: string | null
  exam_date: Date | null
  area_2fase: string | null
  onboarding_done: boolean
  welcome_tour_done: boolean
  email_2fa_enabled: boolean
  daily_goal_override: number | null
  study_reminder_enabled: boolean
  created_at: Date
  updated_at?: Date
}

export interface JwtPayload {
  sub: string
  email: string
  plan: Plan
}

export const defaultProgress = () => ({
  respostas: [] as unknown[],
  salvosRevisao: [] as string[],
  customCards: [] as unknown[],
  flashcardStreak: 0,
  flashcardLastDate: '',
  simulados: [] as unknown[],
  pecasRespostas: [] as unknown[],
})
