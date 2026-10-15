const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile']

const FETCH_TIMEOUT_MS = 90_000

let healthProbeCache: { at: number; ok: boolean; hint?: string } | null = null

export type GroqMessage = {
  role: 'user' | 'model'
  text: string
}

export function getGroqApiKey(): string | undefined {
  const raw = process.env.GROQ_API_KEY?.trim()
  if (!raw) return undefined
  return raw.replace(/^['"]+|['"]+$/g, '') || undefined
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey())
}

export function groqKeyHint(): string | undefined {
  const key = getGroqApiKey()
  if (!key) return undefined
  if (key.startsWith('gsk_')) return `gsk_…${key.slice(-4)}`
  return `key(${key.length} chars)`
}

function modelsToTry(): string[] {
  const preferred = process.env.GROQ_MODEL?.trim()
  const list = preferred ? [preferred, ...FALLBACK_MODELS] : FALLBACK_MODELS
  return [...new Set(list)]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function classifyGroqError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid') && m.includes('api key')) return 'invalid_key'
  if (m.includes('rate limit') || m.includes('429')) return 'rate_limit'
  if (m.includes('quota')) return 'quota'
  if (m.includes('model') && m.includes('not found')) return 'model'
  return 'call_failed'
}

export function lastGroqHealthHint(): string | undefined {
  return healthProbeCache?.hint
}

async function callGroqModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: GroqMessage[],
  maxTokens: number,
): Promise<string> {
  const chatMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.text,
    })),
  ]

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      messages: chatMessages,
      max_tokens: maxTokens,
      temperature: 0.35,
    }),
  })

  const data = (await res.json()) as {
    error?: { message?: string; type?: string }
    choices?: { message?: { content?: string }; finish_reason?: string }[]
  }

  if (!res.ok) {
    const detail = data.error?.message ?? `Groq HTTP ${res.status}`
    const err = new Error(detail) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  const text = data.choices?.[0]?.message?.content?.trim()
  if (text) return text

  const reason = data.choices?.[0]?.finish_reason ?? 'empty'
  throw new Error(`Resposta vazia do Groq (${reason})`)
}

export async function groqGenerate(
  systemPrompt: string,
  messages: GroqMessage[],
  options?: { maxOutputTokens?: number },
): Promise<string> {
  const apiKey = getGroqApiKey()
  if (!apiKey) throw new Error('GROQ_NOT_CONFIGURED')

  const models = modelsToTry()
  const maxTokens = options?.maxOutputTokens ?? 2048
  let lastError: Error | null = null

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callGroqModel(apiKey, model, systemPrompt, messages, maxTokens)
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        const status = (lastError as Error & { status?: number }).status
        const msg = lastError.message.toLowerCase()
        if (status === 404 || msg.includes('model') && msg.includes('not')) break
        if ((status === 429 || status === 503) && attempt < 2) {
          await sleep(800 * 2 ** attempt)
          continue
        }
        if (attempt < 2) {
          await sleep(400)
          continue
        }
        break
      }
    }
  }

  console.error('[groq] falha:', lastError?.message)
  throw lastError ?? new Error('Erro ao chamar Groq')
}

export async function groqHealthProbe(force = false): Promise<boolean> {
  if (!isGroqConfigured()) return false
  const now = Date.now()
  if (!force && healthProbeCache && now - healthProbeCache.at < 180_000) return healthProbeCache.ok

  try {
    const text = await groqGenerate('Responda apenas OK.', [{ role: 'user', text: 'ping' }], { maxOutputTokens: 16 })
    const ok = /ok/i.test(text)
    healthProbeCache = { at: now, ok, hint: ok ? 'ok' : 'unexpected_response' }
    return ok
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const hint = classifyGroqError(msg)
    console.error('[groq] health probe:', hint, msg)
    healthProbeCache = { at: now, ok: false, hint }
    return false
  }
}
