const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface AuthUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro'
  planExpiresAt: string | null
}

export interface PlanLimits {
  plan: 'free' | 'pro'
  simuladosRestantesMes: number | null
  historicoCompleto: boolean
  revisaoErrosCompleta: boolean
}

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
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

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao entrar')
  return data as { token: string; user: AuthUser }
}

export async function apiGoogleLogin(credential: string) {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro no Google')
  return data as { token: string; user: AuthUser }
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

export async function apiSimuladoStart(token: string) {
  const res = await fetch(`${API_URL}/simulado/start`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Não foi possível iniciar simulado')
  return data
}
