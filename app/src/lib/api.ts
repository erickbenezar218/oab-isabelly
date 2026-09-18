const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface UserProfileDto {
  examDate: string | null
  area2fase: string
  onboardingDone: boolean
  welcomeTourDone: boolean
  dailyGoalOverride: number | null
  studyReminderEnabled: boolean
  email2faEnabled: boolean
}

export interface AccountInfoDto {
  hasPassword: boolean
  hasGoogle: boolean
  email2faEnabled: boolean
  dailyGoalOverride: number | null
  studyReminderEnabled: boolean
}

export interface AuthUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro'
  planExpiresAt: string | null
  profile?: UserProfileDto
}

export interface PlanLimits {
  plan: 'free' | 'pro'
  simuladosRestantesMes: number | null
  historicoCompleto: boolean
  revisaoErrosCompleta: boolean
  tutorIa: boolean
  cronograma: boolean
  iaExplicacoesDia: number | null
  tutorChat: boolean
}

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface TutorQuestaoPayload {
  id: string
  materia: string
  exame?: string
  enunciado: string
  alternativas: Record<'A' | 'B' | 'C' | 'D', string>
  resposta_correta: 'A' | 'B' | 'C' | 'D'
}

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function parseApiResponse<T>(res: Response, fallbackError: string): Promise<T> {
  let data: { error?: string } = {}
  try {
    data = (await res.json()) as { error?: string }
  } catch {
    if (!res.ok) throw new Error(`${fallbackError} (${res.status})`)
  }
  if (!res.ok) throw new Error(data.error ?? fallbackError)
  return data as T
}

async function apiPost<T>(path: string, body: unknown, fallbackError: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.')
  }
  return parseApiResponse<T>(res, fallbackError)
}

export async function apiRegister(email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao cadastrar')
  return data as { token: string; user: AuthUser }
}

export type LoginResult =
  | { requiresOtp: true; challengeId: string; email: string }
  | { token: string; user: AuthUser }

export async function apiLogin(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao entrar')
  if (data.requiresOtp) {
    return { requiresOtp: true, challengeId: data.challengeId, email: data.email }
  }
  return { token: data.token, user: data.user }
}

export async function apiForgotPassword(email: string) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao solicitar redefinição')
  return data as { ok: true; message: string }
}

export async function apiValidateResetToken(token: string) {
  const res = await fetch(`${API_URL}/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Link inválido')
  return data as { valid: true; email: string }
}

export async function apiResetPassword(token: string, password: string) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao redefinir senha')
  return data as { ok: true; message: string }
}

export async function apiVerifyOtp(challengeId: string, code: string) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, code }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Código inválido')
  return data as { token: string; user: AuthUser }
}

export async function apiGoogleLogin(credential: string) {
  return apiPost<{ token: string; user: AuthUser }>(
    '/auth/google',
    { credential },
    'Erro ao entrar com Google',
  )
}

export async function apiMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Sessão expirada')
  return (await res.json()) as { user: AuthUser }
}

export async function apiGetProgress(token: string) {
  const res = await fetch(`${API_URL}/progress`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Erro ao carregar progresso')
  return (await res.json()) as { progress: Record<string, unknown>; limits: PlanLimits }
}

export async function apiSaveProgress(token: string, progress: Record<string, unknown>) {
  await fetch(`${API_URL}/progress`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ progress }),
  })
}

export async function apiGetAccount(token: string) {
  const res = await fetch(`${API_URL}/account`, { headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar conta')
  return data as { user: AuthUser; account: AccountInfoDto; profile: UserProfileDto }
}

export async function apiUpdateProfile(
  token: string,
  patch: Partial<UserProfileDto> & { name?: string },
) {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(patch),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao salvar perfil')
  return data as { ok: true; profile: UserProfileDto; account: AccountInfoDto; user: AuthUser }
}

export async function apiChangePassword(token: string, currentPassword: string, newPassword: string) {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao alterar senha')
  return data as { ok: true; message: string }
}

export async function apiSetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_URL}/auth/set-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ newPassword }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao definir senha')
  return data as { ok: true; message: string }
}

export async function apiSimuladoStart(token: string, mode: 'full' | 'express' = 'full') {
  const res = await fetch(`${API_URL}/simulado/start`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ mode }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Não foi possível iniciar simulado')
  return data
}

export async function apiTutorCommentCached(questaoId: string) {
  const res = await fetch(`${API_URL}/tutor/comment/${encodeURIComponent(questaoId)}`)
  if (!res.ok) return { explanation: null as string | null, cached: false }
  return (await res.json()) as { explanation: string | null; cached: boolean }
}

export async function apiTutorComment(
  token: string,
  questao: TutorQuestaoPayload,
  respostaUsuario: string | null,
) {
  const res = await fetch(`${API_URL}/tutor/comment`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ questao, respostaUsuario }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao explicar questão')
  return data as { explanation: string; cached: boolean; remainingMessages: number }
}

export async function apiTutorThread(token: string, questaoId: string) {
  const res = await fetch(`${API_URL}/tutor/thread/${encodeURIComponent(questaoId)}`, {
    headers: authHeaders(token),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar tutor')
  return data as { explanation: string | null; messages: TutorMessage[]; remainingMessages: number }
}

export async function apiTutorExplain(
  token: string,
  questao: TutorQuestaoPayload,
  respostaUsuario: string | null,
) {
  const res = await fetch(`${API_URL}/tutor/explain`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ questao, respostaUsuario }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao explicar questão')
  return data as { explanation: string; messages: TutorMessage[]; remainingMessages: number }
}

export interface BillingConfig {
  enabled: boolean
  sandbox: boolean
  plans: {
    pro: { value: number; label: string; cycle: string }
    reta: { value: number; label: string; cycle: string }
  }
}

export async function apiBillingConfig() {
  const res = await fetch(`${API_URL}/billing/config`)
  if (!res.ok) throw new Error('Erro ao carregar pagamentos')
  return (await res.json()) as BillingConfig
}

export async function apiBillingCheckout(
  token: string,
  plan: 'pro' | 'reta',
  cpfCnpj: string,
  options?: { returnTo?: 'web' | 'app' },
) {
  const res = await fetch(`${API_URL}/billing/checkout`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ plan, cpfCnpj, returnTo: options?.returnTo ?? 'web' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao criar checkout')
  return data as { checkoutUrl: string; sandbox: boolean }
}

export interface BillingStatus {
  plan: 'free' | 'pro'
  planProduct: 'pro' | 'reta' | null
  planExpiresAt: string | null
  subscriptionActive: boolean
  subscriptionCancelled: boolean
  canCancel: boolean
  sandbox: boolean
}

export interface BillingPaymentRow {
  id: string
  planProduct: string
  value: number | null
  status: string
  date: string
  description: string
}

export async function apiBillingStatus(token: string) {
  const res = await fetch(`${API_URL}/billing/status`, { headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar plano')
  return data as BillingStatus
}

export async function apiBillingPayments(token: string) {
  const res = await fetch(`${API_URL}/billing/payments`, { headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar pagamentos')
  return data as { payments: BillingPaymentRow[]; sandbox: boolean }
}

export async function apiBillingCancel(token: string) {
  const res = await fetch(`${API_URL}/billing/cancel`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao cancelar assinatura')
  return data as { ok: boolean; message: string; planExpiresAt: string | null }
}

export async function apiDeleteAccount(
  token: string,
  input: { password?: string; confirmEmail?: string },
) {
  const res = await fetch(`${API_URL}/account`, {
    method: 'DELETE',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao excluir conta')
  return data as { ok: boolean; message: string }
}

export async function apiTutorChat(
  token: string,
  questao: TutorQuestaoPayload,
  respostaUsuario: string | null,
  message: string,
) {
  const res = await fetch(`${API_URL}/tutor/chat`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ questao, respostaUsuario, message }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro no chat')
  return data as { reply: string; messages: TutorMessage[]; remainingMessages: number }
}
