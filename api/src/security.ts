import { isAsaasConfigured } from './asaas.js'

export const DEV_JWT_SECRET = 'dev-secret-change-in-production'

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.ASAAS_ENV === 'production'
}

/** Falha rápido em produção se segredos fracos ou webhook Asaas ausente. */
export function assertProductionConfig(): void {
  if (!isProductionRuntime()) return

  const secret = process.env.JWT_SECRET?.trim()
  if (!secret || secret === DEV_JWT_SECRET || secret.length < 32) {
    throw new Error('JWT_SECRET inválido em produção: use um segredo aleatório com pelo menos 32 caracteres.')
  }

  if (isAsaasConfigured()) {
    const wh = process.env.ASAAS_WEBHOOK_TOKEN?.trim()
    if (!wh || wh.length < 16) {
      throw new Error('ASAAS_WEBHOOK_TOKEN obrigatório em produção quando o Asaas está ativo.')
    }
  }

  if (!process.env.CORS_ORIGIN?.trim()) {
    console.warn('[security] CORS_ORIGIN não definido em produção — revise origens permitidas.')
  }
}

/** Limite agressivo em rotas de autenticação (por IP). */
export const AUTH_RATE_LIMIT = {
  config: {
    rateLimit: {
      max: 12,
      timeWindow: '15 minutes',
    },
  },
}
