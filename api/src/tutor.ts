import type { FastifyInstance } from 'fastify'
import type pg from 'pg'
import { geminiGenerate, type GeminiMessage } from './gemini.js'
import { canGenerateIa, recordIaGeneration } from './iaLimits.js'
import { canUseTutor } from './plans.js'
import type { UserRow } from './types.js'

export const MAX_TUTOR_USER_MESSAGES = 10

export interface QuestaoPayload {
  id: string
  materia: string
  exame?: string
  enunciado: string
  alternativas: Record<'A' | 'B' | 'C' | 'D', string>
  resposta_correta: 'A' | 'B' | 'C' | 'D'
}

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ThreadRow {
  explanation: string | null
  messages: TutorMessage[]
}

function systemPrompt(): string {
  return `Você é o Tutor IA do SimulaOrdem, especialista no Exame da OAB (questões objetivas, prova FGV).
Regras:
- Explique em português claro, objetivo e didático.
- Cite artigos de lei, súmulas ou conceitos quando relevante.
- Foque na questão enviada; não invente fatos fora do enunciado.
- Se o aluno errou, explique por que a alternativa escolhida está errada e por que o gabarito está certo.
- Respostas curtas a follow-ups (máx. 3 parágrafos).
- Não revele dados pessoais; trate o aluno como "você".`
}

function formatQuestaoBlock(q: QuestaoPayload, respostaUsuario: string | null): string {
  return `MATÉRIA: ${q.materia}
${q.exame ? `EXAME: ${q.exame}\n` : ''}ENUNCIADO:
${q.enunciado}

ALTERNATIVAS:
A) ${q.alternativas.A}
B) ${q.alternativas.B}
C) ${q.alternativas.C}
D) ${q.alternativas.D}

GABARITO: ${q.resposta_correta}
RESPOSTA DO ALUNO: ${respostaUsuario ?? '(não respondida)'}`
}

function toGeminiHistory(messages: TutorMessage[]): GeminiMessage[] {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    text: m.content,
  }))
}

async function getThread(pool: pg.Pool, userId: string, questaoId: string): Promise<ThreadRow | null> {
  const { rows } = await pool.query<{ explanation: string | null; messages: TutorMessage[] }>(
    'SELECT explanation, messages FROM tutor_threads WHERE user_id = $1 AND questao_id = $2',
    [userId, questaoId],
  )
  const row = rows[0]
  if (!row) return null
  return { explanation: row.explanation, messages: row.messages ?? [] }
}

async function saveThread(
  pool: pg.Pool,
  userId: string,
  questaoId: string,
  explanation: string | null,
  messages: TutorMessage[],
): Promise<void> {
  await pool.query(
    `INSERT INTO tutor_threads (user_id, questao_id, explanation, messages, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, questao_id)
     DO UPDATE SET explanation = COALESCE(EXCLUDED.explanation, tutor_threads.explanation),
                   messages = EXCLUDED.messages,
                   updated_at = NOW()`,
    [userId, questaoId, explanation, JSON.stringify(messages)],
  )
}

async function getCachedExplanation(pool: pg.Pool, questaoId: string): Promise<string | null> {
  const { rows } = await pool.query<{ explanation: string }>(
    'SELECT explanation FROM question_explanations WHERE questao_id = $1',
    [questaoId],
  )
  return rows[0]?.explanation ?? null
}

async function saveCachedExplanation(pool: pg.Pool, questaoId: string, explanation: string): Promise<void> {
  await pool.query(
    `INSERT INTO question_explanations (questao_id, explanation) VALUES ($1, $2)
     ON CONFLICT (questao_id) DO NOTHING`,
    [questaoId, explanation],
  )
}

async function generateExplanation(questao: QuestaoPayload, respostaUsuario: string | null): Promise<string> {
  const prompt = `${formatQuestaoBlock(questao, respostaUsuario)}

Explique esta questão OAB como um professor faria (gabarito comentado). Estruture:
1) O que a questão cobra
2) Por que o gabarito ${questao.resposta_correta} está correto
3) Por que as outras alternativas estão erradas (breve)
4) Dica de revisão para a prova`

  return geminiGenerate(systemPrompt(), [{ role: 'user', text: prompt }])
}

function proChatRequired(reply: { code: (n: number) => { send: (b: object) => unknown } }) {
  return reply.code(403).send({
    error: 'Chat com o Tutor IA disponível no plano Pro.',
    code: 'TUTOR_CHAT_PRO_REQUIRED',
  })
}

export async function registerTutorRoutes(
  app: FastifyInstance,
  deps: { pool: pg.Pool; getUser: (header?: string) => Promise<UserRow | null> },
) {
  app.get<{ Params: { questaoId: string } }>('/tutor/comment/:questaoId', async (req, reply) => {
    const cached = await getCachedExplanation(deps.pool, req.params.questaoId)
    return { explanation: cached, cached: Boolean(cached) }
  })

  app.post<{
    Body: { questao: QuestaoPayload; respostaUsuario: string | null }
  }>('/tutor/comment', async (req, reply) => {
    const user = await deps.getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Não autenticado.' })

    const { questao, respostaUsuario } = req.body ?? {}
    if (!questao?.id || !questao.enunciado) return reply.code(400).send({ error: 'Questão inválida.' })

    const cached = await getCachedExplanation(deps.pool, questao.id)
    if (cached) {
      return { explanation: cached, cached: true, remainingMessages: canUseTutor(user.plan, user.plan_expires_at) ? MAX_TUTOR_USER_MESSAGES : 0 }
    }

    const allowed = await canGenerateIa(user.id, user.plan, user.plan_expires_at)
    if (!allowed.ok) return reply.code(429).send({ error: allowed.reason, code: 'IA_LIMIT' })

    try {
      const explanation = await generateExplanation(questao, respostaUsuario)
      await saveCachedExplanation(deps.pool, questao.id, explanation)
      await recordIaGeneration(user.id)

      if (canUseTutor(user.plan, user.plan_expires_at)) {
        const messages: TutorMessage[] = [{ role: 'assistant', content: explanation, createdAt: new Date().toISOString() }]
        await saveThread(deps.pool, user.id, questao.id, explanation, messages)
      }

      return { explanation, cached: false, remainingMessages: canUseTutor(user.plan, user.plan_expires_at) ? MAX_TUTOR_USER_MESSAGES : 0 }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro no tutor'
      if (msg === 'GEMINI_NOT_CONFIGURED') {
        return reply.code(503).send({ error: 'IA temporariamente indisponível.' })
      }
      return reply.code(502).send({ error: 'Não foi possível gerar a explicação. Tente novamente.' })
    }
  })

  app.get<{ Params: { questaoId: string } }>('/tutor/thread/:questaoId', async (req, reply) => {
    const user = await deps.getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Não autenticado.' })
    if (!canUseTutor(user.plan, user.plan_expires_at)) return proChatRequired(reply)

    const thread = await getThread(deps.pool, user.id, req.params.questaoId)
    return {
      explanation: thread?.explanation ?? null,
      messages: thread?.messages ?? [],
      remainingMessages: MAX_TUTOR_USER_MESSAGES - (thread?.messages.filter((m) => m.role === 'user').length ?? 0),
    }
  })

  /** @deprecated use /tutor/comment — mantido por compatibilidade */
  app.post<{
    Body: { questao: QuestaoPayload; respostaUsuario: string | null }
  }>('/tutor/explain', async (req, reply) => {
    const user = await deps.getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Não autenticado.' })

    const { questao, respostaUsuario } = req.body ?? {}
    if (!questao?.id) return reply.code(400).send({ error: 'Questão inválida.' })

    const cached = await getCachedExplanation(deps.pool, questao.id)
    if (cached) {
      const thread = await getThread(deps.pool, user.id, questao.id)
      return {
        explanation: cached,
        messages: thread?.messages ?? [{ role: 'assistant', content: cached, createdAt: new Date().toISOString() }],
        remainingMessages: canUseTutor(user.plan, user.plan_expires_at) ? MAX_TUTOR_USER_MESSAGES : 0,
      }
    }

    const allowed = await canGenerateIa(user.id, user.plan, user.plan_expires_at)
    if (!allowed.ok) return reply.code(429).send({ error: allowed.reason })

    try {
      const explanation = await generateExplanation(questao, respostaUsuario)
      await saveCachedExplanation(deps.pool, questao.id, explanation)
      await recordIaGeneration(user.id)
      const messages: TutorMessage[] = [{ role: 'assistant', content: explanation, createdAt: new Date().toISOString() }]
      if (canUseTutor(user.plan, user.plan_expires_at)) {
        await saveThread(deps.pool, user.id, questao.id, explanation, messages)
      }
      return { explanation, messages, remainingMessages: canUseTutor(user.plan, user.plan_expires_at) ? MAX_TUTOR_USER_MESSAGES : 0 }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro'
      if (msg === 'GEMINI_NOT_CONFIGURED') return reply.code(503).send({ error: 'IA indisponível.' })
      return reply.code(502).send({ error: 'Erro ao gerar explicação.' })
    }
  })

  app.post<{
    Body: { questao: QuestaoPayload; respostaUsuario: string | null; message: string }
  }>('/tutor/chat', async (req, reply) => {
    const user = await deps.getUser(req.headers.authorization)
    if (!user) return reply.code(401).send({ error: 'Não autenticado.' })
    if (!canUseTutor(user.plan, user.plan_expires_at)) return proChatRequired(reply)

    const { questao, respostaUsuario, message } = req.body ?? {}
    if (!questao?.id || !message?.trim()) return reply.code(400).send({ error: 'Mensagem inválida.' })

    let thread = await getThread(deps.pool, user.id, questao.id)
    const userCount = thread?.messages.filter((m) => m.role === 'user').length ?? 0
    if (userCount >= MAX_TUTOR_USER_MESSAGES) {
      return reply.code(429).send({ error: `Limite de ${MAX_TUTOR_USER_MESSAGES} perguntas por questão.` })
    }

    if (!thread?.explanation) {
      return reply.code(400).send({ error: 'Gere a explicação inicial antes de conversar.' })
    }

    const userMsg: TutorMessage = {
      role: 'user',
      content: message.trim(),
      createdAt: new Date().toISOString(),
    }
    const messages = [...(thread.messages ?? []), userMsg]

    try {
      const history: GeminiMessage[] = [
        { role: 'user', text: `[Questão OAB]\n${formatQuestaoBlock(questao, respostaUsuario)}` },
        ...toGeminiHistory(thread.messages),
        { role: 'user', text: userMsg.content },
      ]

      const replyText = await geminiGenerate(
        systemPrompt() + '\nResponda à dúvida do aluno sobre ESTA questão específica.',
        history,
      )

      const assistantMsg: TutorMessage = {
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      }
      const updated = [...messages, assistantMsg]
      await saveThread(deps.pool, user.id, questao.id, thread.explanation, updated)

      return {
        reply: replyText,
        messages: updated,
        remainingMessages: MAX_TUTOR_USER_MESSAGES - updated.filter((m) => m.role === 'user').length,
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro no tutor'
      if (msg === 'GEMINI_NOT_CONFIGURED') {
        return reply.code(503).send({ error: 'Tutor IA temporariamente indisponível.' })
      }
      return reply.code(502).send({ error: 'Não foi possível enviar a mensagem. Tente novamente.' })
    }
  })
}
