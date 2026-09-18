import type { FastifyInstance } from 'fastify'
import type pg from 'pg'
import {
  AsaasError,
  cancelSubscription,
  createCustomer,
  createPayment,
  createSubscription,
  externalRef,
  formatDueDate,
  isAsaasConfigured,
  isAsaasSandbox,
  listCustomerPayments,
  listSubscriptionPayments,
  parseExternalRef,
  planPrices,
  type AsaasPayment,
  type AsaasWebhookEvent,
} from './asaas.js'
import { appUrl } from './email.js'
import { effectivePlan } from './auth.js'
import { activateProPlan } from './subscriptions.js'
import type { UserRow } from './types.js'

type BillingDeps = {
  pool: pg.Pool
  getUser: (header?: string) => Promise<UserRow | null>
}

function normalizeCpf(raw: string): string {
  return raw.replace(/\D/g, '')
}

function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let d1 = (sum * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== Number(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  let d2 = (sum * 10) % 11
  if (d2 === 10) d2 = 0
  return d2 === Number(cpf[10])
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function computeExpiresAt(plan: 'pro' | 'reta', current: Date | null): Date {
  const now = new Date()
  if (plan === 'reta') return addDays(now, 90)
  const base = current && current > now ? current : now
  return addDays(base, 32)
}

async function getUserByAsaasCustomer(pool: pg.Pool, customerId: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE asaas_customer_id = $1', [customerId])
  return rows[0] ?? null
}

async function getUserBySubscription(pool: pg.Pool, subscriptionId: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT u.* FROM users u
     JOIN user_billing b ON b.user_id = u.id
     WHERE b.asaas_subscription_id = $1`,
    [subscriptionId],
  )
  return rows[0] ?? null
}

async function ensureAsaasCustomer(pool: pg.Pool, user: UserRow, cpfCnpj: string): Promise<string> {
  const cpf = normalizeCpf(cpfCnpj)
  if (user.asaas_customer_id) {
    await pool.query('UPDATE users SET cpf_cnpj = $1, updated_at = NOW() WHERE id = $2', [cpf, user.id])
    return user.asaas_customer_id
  }

  const customer = await createCustomer({
    name: user.name,
    email: user.email,
    cpfCnpj: cpf,
    externalReference: user.id,
  })

  await pool.query(
    'UPDATE users SET asaas_customer_id = $1, cpf_cnpj = $2, updated_at = NOW() WHERE id = $3',
    [customer.id, cpf, user.id],
  )
  return customer.id
}

async function saveBillingLink(
  pool: pg.Pool,
  userId: string,
  planProduct: 'pro' | 'reta',
  subscriptionId?: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO user_billing (user_id, plan_product, asaas_subscription_id, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       plan_product = EXCLUDED.plan_product,
       asaas_subscription_id = COALESCE(EXCLUDED.asaas_subscription_id, user_billing.asaas_subscription_id),
       updated_at = NOW()`,
    [userId, planProduct, subscriptionId ?? null],
  )
}

async function processPaymentConfirmed(pool: pg.Pool, payment: AsaasPayment): Promise<void> {
  const okStatus = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED'
  if (!okStatus) return

  const dup = await pool.query('SELECT 1 FROM asaas_processed_payments WHERE payment_id = $1', [payment.id])
  if (dup.rowCount) return

  let userId: string | null = null
  let planProduct: 'pro' | 'reta' | null = null

  const parsed = parseExternalRef(payment.externalReference)
  if (parsed) {
    userId = parsed.userId
    planProduct = parsed.plan
  }

  if (!userId && payment.subscription) {
    const user = await getUserBySubscription(pool, payment.subscription)
    if (user) {
      userId = user.id
      planProduct = 'pro'
    }
  }

  if (!userId && payment.customer) {
    const user = await getUserByAsaasCustomer(pool, payment.customer)
    if (user) {
      const billing = await pool.query<{ plan_product: string }>(
        'SELECT plan_product FROM user_billing WHERE user_id = $1',
        [user.id],
      )
      userId = user.id
      planProduct = (billing.rows[0]?.plan_product as 'pro' | 'reta') ?? 'pro'
    }
  }

  if (!userId || !planProduct) {
    console.warn('[billing] pagamento sem usuário mapeado:', payment.id)
    return
  }

  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId])
  const user = rows[0]
  if (!user) return

  const expiresAt = computeExpiresAt(planProduct, user.plan_expires_at)
  await activateProPlan(userId, expiresAt)
  await pool.query(
    'INSERT INTO asaas_processed_payments (payment_id, user_id, plan_product) VALUES ($1, $2, $3)',
    [payment.id, userId, planProduct],
  )
}

export async function registerBillingRoutes(app: FastifyInstance, deps: BillingDeps): Promise<void> {
  const { pool, getUser } = deps
  const prices = planPrices()

  app.get('/billing/config', async () => ({
    enabled: isAsaasConfigured(),
    sandbox: isAsaasSandbox(),
    plans: {
      pro: { value: prices.pro, label: 'Pro mensal', cycle: 'MONTHLY' as const },
      reta: { value: prices.reta, label: 'Reta Final 3 meses', cycle: 'ONETIME' as const },
    },
  }))

  app.post<{ Body: { plan?: string; cpfCnpj?: string; returnTo?: string } }>('/billing/checkout', async (req, reply) => {
    if (!isAsaasConfigured()) {
      return reply.code(503).send({ error: 'Pagamentos não configurados. Tente mais tarde.' })
    }

    const user = await getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Faça login para assinar.' })

    const plan = req.body?.plan
    if (plan !== 'pro' && plan !== 'reta') {
      return reply.code(400).send({ error: 'Plano inválido.' })
    }

    const cpf = normalizeCpf(req.body?.cpfCnpj ?? user.cpf_cnpj ?? '')
    if (!isValidCpf(cpf)) {
      return reply.code(400).send({ error: 'Informe um CPF válido.' })
    }

    try {
      const customerId = await ensureAsaasCustomer(pool, user, cpf)
      const returnToApp = req.body?.returnTo === 'app'
      const successUrl = returnToApp
        ? `${appUrl()}/payment/return?plan=${plan}`
        : `${appUrl()}/planos/sucesso?plan=${plan}`
      const callback = { successUrl, autoRedirect: true }

      if (plan === 'pro') {
        const subscription = await createSubscription({
          customer: customerId,
          billingType: 'UNDEFINED',
          value: prices.pro,
          nextDueDate: formatDueDate(),
          cycle: 'MONTHLY',
          description: 'SimulaOrdem Pro — assinatura mensal',
          externalReference: externalRef(user.id, 'pro'),
          callback,
        })

        await saveBillingLink(pool, user.id, 'pro', subscription.id)

        const payments = await listSubscriptionPayments(subscription.id)
        const pending = payments.find((p) => p.invoiceUrl) ?? payments[0]
        if (!pending?.invoiceUrl) {
          return reply.code(502).send({ error: 'Cobrança criada, mas link de pagamento indisponível. Tente em instantes.' })
        }

        return {
          checkoutUrl: pending.invoiceUrl,
          plan,
          sandbox: isAsaasSandbox(),
          paymentId: pending.id,
          subscriptionId: subscription.id,
        }
      }

      const payment = await createPayment({
        customer: customerId,
        billingType: 'UNDEFINED',
        value: prices.reta,
        dueDate: formatDueDate(),
        description: 'SimulaOrdem Reta Final — 3 meses de acesso Pro',
        externalReference: externalRef(user.id, 'reta'),
        callback,
      })

      await saveBillingLink(pool, user.id, 'reta')

      if (!payment.invoiceUrl) {
        return reply.code(502).send({ error: 'Cobrança criada, mas link de pagamento indisponível.' })
      }

      return {
        checkoutUrl: payment.invoiceUrl,
        plan,
        sandbox: isAsaasSandbox(),
        paymentId: payment.id,
      }
    } catch (err) {
      if (err instanceof AsaasError) {
        console.error('[billing] Asaas:', err.body)
        return reply.code(502).send({ error: 'Erro ao criar cobrança. Verifique os dados ou tente mais tarde.' })
      }
      throw err
    }
  })

  app.get('/billing/status', async (req, reply) => {
    const user = await getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Faça login.' })

    const plan = effectivePlan(user.plan, user.plan_expires_at)
    const { rows } = await pool.query<{
      plan_product: string
      asaas_subscription_id: string | null
      subscription_cancelled_at: Date | null
    }>('SELECT plan_product, asaas_subscription_id, subscription_cancelled_at FROM user_billing WHERE user_id = $1', [
      user.id,
    ])
    const billing = rows[0]
    const subscriptionCancelled = Boolean(billing?.subscription_cancelled_at)
    const hasSubscription = Boolean(billing?.asaas_subscription_id)
    const canCancel = plan === 'pro' && hasSubscription && !subscriptionCancelled && billing?.plan_product === 'pro'

    return {
      plan,
      planProduct: billing?.plan_product ?? null,
      planExpiresAt: user.plan_expires_at?.toISOString() ?? null,
      subscriptionActive: hasSubscription && !subscriptionCancelled,
      subscriptionCancelled,
      canCancel,
      sandbox: isAsaasSandbox(),
    }
  })

  app.get('/billing/payments', async (req, reply) => {
    const user = await getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Faça login.' })

    const local = await pool.query<{ payment_id: string; plan_product: string; processed_at: Date }>(
      `SELECT payment_id, plan_product, processed_at FROM asaas_processed_payments
       WHERE user_id = $1 ORDER BY processed_at DESC LIMIT 24`,
      [user.id],
    )

    const byId = new Map<
      string,
      { id: string; planProduct: string; value: number | null; status: string; date: string; description: string }
    >()

    for (const row of local.rows) {
      byId.set(row.payment_id, {
        id: row.payment_id,
        planProduct: row.plan_product,
        value: null,
        status: 'CONFIRMED',
        date: row.processed_at.toISOString(),
        description: row.plan_product === 'reta' ? 'Reta Final — 3 meses' : 'Pro mensal',
      })
    }

    if (user.asaas_customer_id && isAsaasConfigured()) {
      try {
        const remote = await listCustomerPayments(user.asaas_customer_id)
        for (const p of remote) {
          const parsed = parseExternalRef(p.externalReference)
          const planProduct = parsed?.plan ?? (p.subscription ? 'pro' : 'reta')
          const date = p.paymentDate ?? p.dueDate ?? new Date().toISOString()
          byId.set(p.id, {
            id: p.id,
            planProduct,
            value: p.value,
            status: p.status,
            date,
            description: p.description ?? (planProduct === 'reta' ? 'Reta Final' : 'Pro mensal'),
          })
        }
      } catch (err) {
        console.warn('[billing] list payments:', err)
      }
    }

    const payments = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date))
    return { payments, sandbox: isAsaasSandbox() }
  })

  app.post('/billing/cancel', async (req, reply) => {
    if (!isAsaasConfigured()) {
      return reply.code(503).send({ error: 'Pagamentos não configurados.' })
    }

    const user = await getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Faça login.' })

    const { rows } = await pool.query<{
      plan_product: string
      asaas_subscription_id: string | null
      subscription_cancelled_at: Date | null
    }>('SELECT plan_product, asaas_subscription_id, subscription_cancelled_at FROM user_billing WHERE user_id = $1', [
      user.id,
    ])
    const billing = rows[0]

    if (!billing?.asaas_subscription_id) {
      return reply.code(400).send({ error: 'Nenhuma assinatura mensal ativa para cancelar.' })
    }
    if (billing.subscription_cancelled_at) {
      return reply.code(400).send({ error: 'Assinatura já cancelada. Seu Pro permanece até a data de vencimento.' })
    }
    if (billing.plan_product !== 'pro') {
      return reply.code(400).send({ error: 'Plano Reta Final não tem renovação — o acesso expira automaticamente.' })
    }

    try {
      await cancelSubscription(billing.asaas_subscription_id)
      await pool.query(
        `UPDATE user_billing SET subscription_cancelled_at = NOW(), updated_at = NOW() WHERE user_id = $1`,
        [user.id],
      )
      return {
        ok: true,
        message: 'Assinatura cancelada. Você mantém o Pro até o fim do período já pago.',
        planExpiresAt: user.plan_expires_at?.toISOString() ?? null,
      }
    } catch (err) {
      if (err instanceof AsaasError) {
        console.error('[billing] cancel:', err.body)
        return reply.code(502).send({ error: 'Não foi possível cancelar agora. Tente de novo ou contate suporte.' })
      }
      throw err
    }
  })

  app.post('/billing/webhook', async (req, reply) => {
    const token = process.env.ASAAS_WEBHOOK_TOKEN?.trim()
    if (token) {
      const header = req.headers['asaas-access-token']
      if (header !== token) {
        return reply.code(401).send({ error: 'Webhook não autorizado.' })
      }
    }

    const body = req.body as AsaasWebhookEvent
    if (!body?.event) return reply.code(400).send({ error: 'Evento inválido.' })

    await pool.query(
      'INSERT INTO asaas_billing_events (event_id) VALUES ($1) ON CONFLICT (event_id) DO NOTHING',
      [body.id],
    )

    try {
      if (body.payment && (body.event === 'PAYMENT_CONFIRMED' || body.event === 'PAYMENT_RECEIVED')) {
        await processPaymentConfirmed(pool, body.payment)
      }
    } catch (err) {
      console.error('[billing] webhook erro:', err)
    }

    return { received: true }
  })
}
