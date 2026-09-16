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
  created_at: Date
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
  profile: {} as Record<string, unknown>,
})
