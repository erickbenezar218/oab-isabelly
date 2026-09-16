const SANDBOX_URL = 'https://api-sandbox.asaas.com/v3'
const PRODUCTION_URL = 'https://api.asaas.com/v3'

export type AsaasCustomer = {
  id: string
  name: string
  email: string
  cpfCnpj: string
}

export type AsaasPayment = {
  id: string
  customer: string
  subscription?: string
  status: string
  value: number
  invoiceUrl?: string
  externalReference?: string
}

export type AsaasSubscription = {
  id: string
  customer: string
  status: string
  externalReference?: string
}

export type AsaasWebhookEvent = {
  id: string
  event: string
  payment?: AsaasPayment
  subscription?: { id: string; customer: string; externalReference?: string; status?: string }
}

export function getAsaasApiKey(): string | undefined {
  const b64 = process.env.ASAAS_API_KEY_B64?.trim()
  if (b64) {
    try {
      return Buffer.from(b64, 'base64').toString('utf8').trim() || undefined
    } catch {
      return undefined
    }
  }
  const key = process.env.ASAAS_API_KEY?.trim()
  return key || undefined
}

export function isAsaasConfigured(): boolean {
  return Boolean(getAsaasApiKey())
}

export function isAsaasSandbox(): boolean {
  return process.env.ASAAS_ENV !== 'production'
}

export function asaasBaseUrl(): string {
  return isAsaasSandbox() ? SANDBOX_URL : PRODUCTION_URL
}

function userAgent() {
  return process.env.ASAAS_USER_AGENT ?? 'SimulaOrdem/1.0'
}

export class AsaasError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: string,
  ) {
    super(message)
    this.name = 'AsaasError'
  }
}

export async function asaasRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = getAsaasApiKey()
  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada')

  const res = await fetch(`${asaasBaseUrl()}${path}`, {
    ...init,
    headers: {
      access_token: apiKey,
      'Content-Type': 'application/json',
      'User-Agent': userAgent(),
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  if (!res.ok) {
    throw new AsaasError(`Asaas ${res.status}: ${text}`, res.status, text)
  }

  return text ? (JSON.parse(text) as T) : ({} as T)
}

export async function createCustomer(input: {
  name: string
  email: string
  cpfCnpj: string
  externalReference: string
}): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function createSubscription(input: {
  customer: string
  billingType: 'UNDEFINED'
  value: number
  nextDueDate: string
  cycle: 'MONTHLY'
  description: string
  externalReference: string
  callback: { successUrl: string; autoRedirect: boolean }
}): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function listSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const data = await asaasRequest<{ data: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`)
  return data.data ?? []
}

export async function createPayment(input: {
  customer: string
  billingType: 'UNDEFINED'
  value: number
  dueDate: string
  description: string
  externalReference: string
  callback: { successUrl: string; autoRedirect: boolean }
}): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function planPrices() {
  return {
    pro: Number(process.env.ASAAS_PRO_VALUE ?? 24.9),
    reta: Number(process.env.ASAAS_RETA_VALUE ?? 59.9),
  }
}

export function formatDueDate(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function externalRef(userId: string, plan: 'pro' | 'reta'): string {
  return `simulaordem:${userId}:${plan}`
}

export function parseExternalRef(ref?: string | null): { userId: string; plan: 'pro' | 'reta' } | null {
  if (!ref?.startsWith('simulaordem:')) return null
  const [, userId, plan] = ref.split(':')
  if (!userId || (plan !== 'pro' && plan !== 'reta')) return null
  return { userId, plan }
}
