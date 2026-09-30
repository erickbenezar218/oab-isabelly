const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']

const FETCH_TIMEOUT_MS = 90_000
const MAX_ATTEMPTS_PER_MODEL = 3

export interface GeminiMessage {
  role: 'user' | 'model'
  text: string
}

export function getGeminiApiKey(): string | undefined {
  const b64 = process.env.GEMINI_API_KEY_B64?.trim()
  if (b64) {
    try {
      return Buffer.from(b64, 'base64').toString('utf8').trim() || undefined
    } catch {
      return undefined
    }
  }
  return process.env.GEMINI_API_KEY?.trim() || undefined
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

async function callGeminiModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: GeminiMessage[],
  maxOutputTokens: number,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let fetchUrl = url
  if (apiKey.startsWith('AIza')) {
    fetchUrl = `${url}?key=${encodeURIComponent(apiKey)}`
  } else {
    headers['x-goog-api-key'] = apiKey
  }

  const res = await fetch(fetchUrl, {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  })

  const data = (await res.json()) as {
    error?: { message?: string; status?: string; code?: number }
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

  const reason = candidate?.finishReason ?? 'unknown'
  const err = new Error(`Resposta vazia do Gemini (${reason})`) as Error & { status?: number; finishReason?: string }
  err.finishReason = reason
  if (reason === 'MAX_TOKENS') err.status = 503
  throw err
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

  for (const model of models) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        return await callGeminiModel(apiKey, model, systemPrompt, messages, maxOutputTokens)
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        const status = (lastError as Error & { status?: number }).status
        const finishReason = (lastError as Error & { finishReason?: string }).finishReason

        if (finishReason === 'MAX_TOKENS' && maxOutputTokens < 4096) {
          maxOutputTokens = Math.min(4096, Math.round(maxOutputTokens * 1.5))
          console.warn(`[gemini] ${model} MAX_TOKENS, aumentando limite para ${maxOutputTokens}`)
          continue
        }

        const msg = lastError.message
        if (shouldTryNextModel(status, msg)) {
          console.warn(`[gemini] modelo ${model} indisponível, tentando próximo…`, msg)
          break
        }

        if (isRetryableHttp(status, msg) && attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          const wait = 600 * 2 ** attempt + Math.floor(Math.random() * 400)
          console.warn(`[gemini] ${model} tentativa ${attempt + 1} falhou, retry em ${wait}ms:`, msg)
          await sleep(wait)
          continue
        }

        if (attempt < MAX_ATTEMPTS_PER_MODEL - 1 && !shouldTryNextModel(status, msg)) {
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
