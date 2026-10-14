/** Modelos estáveis para tutor (2.0 evita “thinking” comer o limite de saída). */
const FALLBACK_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']

const FETCH_TIMEOUT_MS = 90_000
const MAX_ATTEMPTS_PER_MODEL = 3

let healthProbeCache: { at: number; ok: boolean; hint?: string } | null = null

export interface GeminiMessage {
  role: 'user' | 'model'
  text: string
}

function normalizeApiKey(raw: string): string {
  return raw.trim().replace(/^['"]+|['"]+$/g, '')
}

export function getGeminiApiKey(): string | undefined {
  const plain = process.env.GEMINI_API_KEY?.trim()
  if (plain) return normalizeApiKey(plain) || undefined

  const b64 = process.env.GEMINI_API_KEY_B64?.trim()
  if (b64) {
    try {
      return normalizeApiKey(Buffer.from(b64, 'base64').toString('utf8')) || undefined
    } catch {
      return undefined
    }
  }
  return undefined
}

export function geminiKeyHint(): string | undefined {
  const key = getGeminiApiKey()
  if (!key) return undefined
  if (key.startsWith('AIza')) return `AIza…${key.slice(-4)}`
  return `custom(${key.length} chars)`
}

export function classifyGeminiError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('api key') || m.includes('api_key') || m.includes('permission denied')) return 'invalid_key'
  if (m.includes('quota') || m.includes('resource exhausted')) return 'quota'
  if (m.includes('not found') || m.includes('not supported')) return 'model'
  if (m.includes('billing') || m.includes('enable')) return 'api_disabled'
  return 'call_failed'
}

export function lastGeminiHealthHint(): string | undefined {
  return healthProbeCache?.hint
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey())
}

function modelsToTry(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim()
  const list = preferred ? [preferred, ...FALLBACK_MODELS] : FALLBACK_MODELS
  return [...new Set(list)]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableHttp(status?: number, message = ''): boolean {
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) return true
  const msg = message.toLowerCase()
  return (
    msg.includes('resource exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('overloaded') ||
    msg.includes('unavailable') ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('fetch failed') ||
    msg.includes('econnreset') ||
    msg.includes('network')
  )
}

function shouldTryNextModel(status?: number, message = ''): boolean {
  if (status === 404) return true
  const msg = message.toLowerCase()
  return (
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('shut down') ||
    msg.includes('deprecated') ||
    msg.includes('is not found for api version')
  )
}

function shouldDisableThinkingConfig(message: string): boolean {
  const msg = message.toLowerCase()
  return msg.includes('thinking') && (msg.includes('does not support') || msg.includes('invalid_argument'))
}

function buildGenerationConfig(model: string, maxOutputTokens: number, useThinkingOff: boolean) {
  const generationConfig: Record<string, unknown> = {
    temperature: 0.35,
    maxOutputTokens,
  }
  if (useThinkingOff && /gemini-2\.5/i.test(model) && !/pro/i.test(model)) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 }
  }
  return generationConfig
}

function buildSafetySettings(relaxed: boolean) {
  const threshold = relaxed ? 'BLOCK_NONE' : 'BLOCK_ONLY_HIGH'
  return [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold },
  ]
}

async function callGeminiModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: GeminiMessage[],
  maxOutputTokens: number,
  options?: { useThinkingOff?: boolean; relaxedSafety?: boolean; embedSystemInUser?: boolean },
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const useThinkingOff = options?.useThinkingOff !== false
  const relaxedSafety = options?.relaxedSafety === true
  const embedSystem = options?.embedSystemInUser === true

  let contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  let systemInstruction: { parts: { text: string }[] } | undefined = {
    parts: [{ text: systemPrompt }],
  }

  if (embedSystem) {
    systemInstruction = undefined
    const merged = `${systemPrompt}\n\n---\n\n${messages.map((m) => m.text).join('\n\n')}`
    contents = [{ role: 'user', parts: [{ text: merged }] }]
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const fetchUrl = `${url}?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(fetchUrl, {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    body: JSON.stringify({
      ...(systemInstruction ? { systemInstruction } : {}),
      contents,
      generationConfig: buildGenerationConfig(model, maxOutputTokens, useThinkingOff),
      safetySettings: buildSafetySettings(relaxedSafety),
    }),
  })

  const data = (await res.json()) as {
    error?: { message?: string; status?: string; code?: number }
    promptFeedback?: { blockReason?: string }
    candidates?: {
      finishReason?: string
      content?: { parts?: { text?: string }[] }
    }[]
  }

  if (!res.ok) {
    const detail = data.error?.message ?? `Gemini HTTP ${res.status}`
    const err = new Error(detail) as Error & { status?: number; model?: string }
    err.status = res.status
    err.model = model
    throw err
  }

  const candidate = data.candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  if (text) return text

  const block = data.promptFeedback?.blockReason
  const reason = candidate?.finishReason ?? block ?? 'unknown'
  const err = new Error(`Resposta vazia do Gemini (${reason})`) as Error & {
    status?: number
    finishReason?: string
    blockReason?: string
  }
  err.finishReason = reason
  err.blockReason = block
  if (reason === 'MAX_TOKENS' || reason === 'SAFETY' || block) err.status = 503
  throw err
}

type CallOptions = {
  useThinkingOff?: boolean
  relaxedSafety?: boolean
  embedSystemInUser?: boolean
}

export async function geminiGenerate(
  systemPrompt: string,
  messages: GeminiMessage[],
  options?: { maxOutputTokens?: number },
): Promise<string> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_NOT_CONFIGURED')
  }

  const models = modelsToTry()
  let maxOutputTokens = options?.maxOutputTokens ?? 2048
  let lastError: Error | null = null

  const callModes: CallOptions[] = [
    { useThinkingOff: true, relaxedSafety: false, embedSystemInUser: false },
    { useThinkingOff: true, relaxedSafety: true, embedSystemInUser: false },
    { useThinkingOff: false, relaxedSafety: true, embedSystemInUser: true },
  ]

  for (const model of models) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const mode = callModes[Math.min(attempt, callModes.length - 1)]
      try {
        return await callGeminiModel(apiKey, model, systemPrompt, messages, maxOutputTokens, mode)
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        const status = (lastError as Error & { status?: number }).status
        const finishReason = (lastError as Error & { finishReason?: string }).finishReason

        if (shouldDisableThinkingConfig(lastError.message) && mode.useThinkingOff) {
          try {
            return await callGeminiModel(apiKey, model, systemPrompt, messages, maxOutputTokens, {
              ...mode,
              useThinkingOff: false,
            })
          } catch (e2) {
            lastError = e2 instanceof Error ? e2 : new Error(String(e2))
          }
        }

        if (finishReason === 'MAX_TOKENS' && maxOutputTokens < 8192) {
          maxOutputTokens = Math.min(8192, Math.round(maxOutputTokens * 1.8))
          console.warn(`[gemini] ${model} MAX_TOKENS, limite → ${maxOutputTokens}`)
          continue
        }

        if (finishReason === 'SAFETY' && attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          continue
        }

        const msg = lastError.message
        if (shouldTryNextModel(status, msg)) {
          console.warn(`[gemini] modelo ${model} indisponível, próximo…`, msg)
          break
        }

        if (isRetryableHttp(status, msg) && attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          const wait = 600 * 2 ** attempt + Math.floor(Math.random() * 400)
          console.warn(`[gemini] ${model} retry em ${wait}ms:`, msg)
          await sleep(wait)
          continue
        }

        if (attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          await sleep(400)
          continue
        }

        break
      }
    }
  }

  console.error('[gemini] falha após retries:', lastError?.message)
  throw lastError ?? new Error('Erro ao chamar Gemini')
}

/** Teste real (cache 3 min) — health?status=1 */
export async function geminiHealthProbe(force = false): Promise<boolean> {
  if (!isGeminiConfigured()) return false
  const now = Date.now()
  if (!force && healthProbeCache && now - healthProbeCache.at < 180_000) return healthProbeCache.ok
  try {
    const text = await callGeminiModel(
      getGeminiApiKey()!,
      'gemini-2.0-flash',
      'Responda só OK.',
      [{ role: 'user', text: 'ping' }],
      64,
      { useThinkingOff: false, relaxedSafety: false, embedSystemInUser: true },
    )
    const ok = /ok/i.test(text)
    healthProbeCache = { at: now, ok, hint: ok ? 'ok' : 'unexpected_response' }
    return ok
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const hint = classifyGeminiError(msg)
    console.error('[gemini] health probe falhou:', hint, msg)
    healthProbeCache = { at: now, ok: false, hint }
    return false
  }
}
