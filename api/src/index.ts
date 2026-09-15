import Fastify from 'fastify'
import cors from '@fastify/cors'
import { initDb, pool } from './db.js'
import { comparePassword, effectivePlan, hashPassword, signToken, verifyGoogleToken, verifyToken } from './auth.js'
import { canStartSimulado, currentYearMonth, filterProgressForPlan, isPro, recordSimuladoUsage } from './plans.js'
import { defaultProgress } from './types.js'
import type { JwtPayload, UserRow } from './types.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  credentials: true,
})

await initDb()

function userPublic(u: UserRow) {
  const plan = effectivePlan(u.plan, u.plan_expires_at)
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    plan,
    planExpiresAt: u.plan_expires_at?.toISOString() ?? null,
  }
}

async function getUserFromAuth(header?: string): Promise<UserRow | null> {
  if (!header?.startsWith('Bearer ')) return null
  try {
    const payload = verifyToken(header.slice(7))
    const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [payload.sub])
    return rows[0] ?? null
  } catch {
    return null
  }
}

app.get('/health', async () => ({ ok: true, service: 'simulaordem-api' }))

app.post<{ Body: { email: string; password: string; name: string } }>('/auth/register', async (req, reply) => {
  const { email, password, name } = req.body ?? {}
  if (!email?.includes('@') || !password || password.length < 6 || !name?.trim()) {
    return reply.code(400).send({ error: 'Dados inválidos. Senha mínima: 6 caracteres.' })
  }
  const normalized = email.trim().toLowerCase()
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalized])
  if (existing.rowCount) return reply.code(409).send({ error: 'E-mail já cadastrado.' })

  const passwordHash = await hashPassword(password)
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [normalized, name.trim(), passwordHash],
  )
  const user = rows[0]
  await pool.query('INSERT INTO user_progress (user_id, data) VALUES ($1, $2)', [user.id, defaultProgress()])
  const token = signToken({ sub: user.id, email: user.email, plan: user.plan })
  return { token, user: userPublic(user) }
})

app.post<{ Body: { email: string; password: string } }>('/auth/login', async (req, reply) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) return reply.code(400).send({ error: 'E-mail e senha obrigatórios.' })
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
  const user = rows[0]
  if (!user?.password_hash || !(await comparePassword(password, user.password_hash))) {
    return reply.code(401).send({ error: 'E-mail ou senha incorretos.' })
  }
  const plan = effectivePlan(user.plan, user.plan_expires_at)
  const token = signToken({ sub: user.id, email: user.email, plan })
  return { token, user: userPublic(user) }
})

app.post<{ Body: { credential: string } }>('/auth/google', async (req, reply) => {
  const googleUser = await verifyGoogleToken(req.body?.credential ?? '')
  if (!googleUser) {
    return reply.code(503).send({ error: 'Login com Google não configurado ou token inválido.' })
  }
  let { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE google_id = $1 OR email = $2', [
    googleUser.sub,
    googleUser.email.toLowerCase(),
  ])
  let user = rows[0]
  if (!user) {
    const inserted = await pool.query<UserRow>(
      `INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *`,
      [googleUser.email.toLowerCase(), googleUser.name, googleUser.sub],
    )
    user = inserted.rows[0]
    await pool.query('INSERT INTO user_progress (user_id, data) VALUES ($1, $2)', [user.id, defaultProgress()])
  } else if (!user.google_id) {
    await pool.query('UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2', [googleUser.sub, user.id])
    user.google_id = googleUser.sub
  }
  const plan = effectivePlan(user.plan, user.plan_expires_at)
  const token = signToken({ sub: user.id, email: user.email, plan })
  return { token, user: userPublic(user) }
})

app.get('/auth/me', async (req, reply) => {
  const user = await getUserFromAuth(req.headers.authorization)
  if (!user) return reply.code(401).send({ error: 'Não autenticado.' })
  return { user: userPublic(user) }
})

app.get('/progress', async (req, reply) => {
  const user = await getUserFromAuth(req.headers.authorization)
  if (!user) return reply.code(401).send({ error: 'Não autenticado.' })
  const { rows } = await pool.query<{ data: Record<string, unknown> }>(
    'SELECT data FROM user_progress WHERE user_id = $1',
    [user.id],
  )
  const raw = rows[0]?.data ?? defaultProgress()
  const pro = isPro(user.plan, user.plan_expires_at)
  const ym = currentYearMonth()
  const usage = await pool.query<{ count: string }>(
    'SELECT count FROM simulado_usage WHERE user_id = $1 AND year_month = $2',
    [user.id, ym],
  )
  return {
    progress: filterProgressForPlan(raw, pro),
    limits: {
      plan: effectivePlan(user.plan, user.plan_expires_at),
      simuladosRestantesMes: pro ? null : Math.max(0, 1 - Number(usage.rows[0]?.count ?? 0)),
      historicoCompleto: pro,
      revisaoErrosCompleta: pro,
    },
  }
})

app.put<{ Body: { progress: Record<string, unknown> } }>('/progress', async (req, reply) => {
  const user = await getUserFromAuth(req.headers.authorization)
  if (!user) return reply.code(401).send({ error: 'Não autenticado.' })
  const progress = req.body?.progress
  if (!progress || typeof progress !== 'object') return reply.code(400).send({ error: 'Progresso inválido.' })
  await pool.query(
    `INSERT INTO user_progress (user_id, data, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()`,
    [user.id, progress],
  )
  return { ok: true }
})

app.post('/simulado/start', async (req, reply) => {
  const user = await getUserFromAuth(req.headers.authorization)
  if (!user) return reply.code(401).send({ error: 'Não autenticado.' })
  const plan = effectivePlan(user.plan, user.plan_expires_at)
  const allowed = await canStartSimulado(user.id, plan, user.plan_expires_at)
  if (!allowed) {
    return reply.code(403).send({
      error: 'Limite do plano grátis: 1 simulado por mês. Assine o Pro para simulados ilimitados.',
      code: 'SIMULADO_LIMIT',
    })
  }
  if (plan === 'free') await recordSimuladoUsage(user.id)
  return { ok: true }
})

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'
await app.listen({ port, host })
