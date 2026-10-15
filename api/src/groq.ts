const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
/** Llama 3.x saiu do tier free/dev em 2026-08-16 — ver console.groq.com/docs/deprecations */
const DEFAULT_MODEL = 'openai/gpt-oss-120b'
const FALLBACK_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b']
const DEPRECATED_MODEL_IDS = new Set([
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama-3.3-70b-specdec',
])

const FETCH_TIMEOUT_MS = 90_000

let healthProbeCache: { at: number; ok: boolean; hint?: string; detail?: string } | null = null

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
  const list = preferred ? [preferred, ...FALLBACK_MODELS] : [DEFAULT_MODEL, ...FALLBACK_MODELS]
  return [...new Set(list.filter((id) => id && !DEPRECATED_MODEL_IDS.has(id)))]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function classifyGroqError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid') && m.includes('api key')) return 'invalid_key'
  if (m.includes('rate limit') || m.includes('429')) return 'rate_limit'
  if (m.includes('quota')) return 'quota'
  if (
    m.includes('model') &&
    (m.includes('not found') || m.includes('does not exist') || m.includes('decommissioned'))
  ) {
    return 'model'
  }
  return 'call_failed'
}

export function lastGroqHealthHint(): string | undefined {
  return healthProbeCache?.hint
}

export function lastGroqHealthDetail(): string | undefined {
  return healthProbeCache?.detail
}

function usesGroqReasoningBudget(model: string): boolean {
  return /gpt-oss|qwen\/qwen3/i.test(model)
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

  const reasoningModel = usesGroqReasoningBudget(model)
  const body: Record<string, unknown> = {
    model,
    messages: chatMessages,
    temperature: 0.35,
  }
  if (reasoningModel) {
    body.max_completion_tokens = Math.max(maxTokens, 512)
    body.reasoning_effort = 'low'
    body.include_reasoning = false
  } else {
    body.max_tokens = maxTokens
  }

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as {
    error?: { message?: string; type?: string }
    choices?: {
      message?: { content?: string | null; reasoning?: string | null }
      finish_reason?: string
    }[]
  }

  if (!res.ok) {
    const detail = data.error?.message ?? `Groq HTTP ${res.status}`
    const err = new Error(detail) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  const choice = data.choices?.[0]
  const text = choice?.message?.content?.trim()
  if (text) return text

  const reason = choice?.finish_reason ?? 'empty'
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
        if (
          status === 404 ||
          (msg.includes('model') &&
            (msg.includes('not found') || msg.includes('does not exist') || msg.includes('decommissioned')))
        ) {
          break
        }
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
    const text = await groqGenerate('Responda apenas OK.', [{ role: 'user', text: 'ping' }], { maxOutputTokens: 64 })
    const ok = /ok/i.test(text)
    healthProbeCache = { at: now, ok, hint: ok ? 'ok' : 'unexpected_response' }
    return ok
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const hint = classifyGroqError(msg)
    console.error('[groq] health probe:', hint, msg)
    healthProbeCache = { at: now, ok: false, hint, detail: msg.slice(0, 160) }
    return false
  }
}
