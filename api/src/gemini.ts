const DEFAULT_MODEL = 'gemini-2.5-flash'
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash-lite', 'gemini-1.5-flash']

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

async function callGeminiModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: GeminiMessage[],
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
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
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
  throw new Error(`Resposta vazia do Gemini (${reason})`)
}

export async function geminiGenerate(systemPrompt: string, messages: GeminiMessage[]): Promise<string> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_NOT_CONFIGURED')
  }

  const models = modelsToTry()
  let lastError: Error | null = null

  for (const model of models) {
    try {
      return await callGeminiModel(apiKey, model, systemPrompt, messages)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      const status = (lastError as Error & { status?: number }).status
      const msg = lastError.message.toLowerCase()
      const retryable =
        status === 404 ||
        status === 429 ||
        msg.includes('not found') ||
        msg.includes('not supported') ||
        msg.includes('shut down') ||
        msg.includes('deprecated') ||
        msg.includes('model')
      if (!retryable) break
      console.warn(`[gemini] modelo ${model} indisponível, tentando próximo…`, lastError.message)
    }
  }

  console.error('[gemini] falha em todos os modelos:', lastError?.message)
  throw lastError ?? new Error('Erro ao chamar Gemini')
}
