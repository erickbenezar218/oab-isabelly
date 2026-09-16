const DEFAULT_MODEL = 'gemini-2.0-flash'

export interface GeminiMessage {
  role: 'user' | 'model'
  text: string
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export async function geminiGenerate(systemPrompt: string, messages: GeminiMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_NOT_CONFIGURED')
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  // Suporta chaves AIza... (query) e chaves novas AQ... (header)
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
        maxOutputTokens: 1024,
      },
    }),
  })

  const data = (await res.json()) as {
    error?: { message?: string; status?: string }
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }

  if (!res.ok) {
    const detail = data.error?.message ?? `Gemini HTTP ${res.status}`
    throw new Error(detail)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) throw new Error('Resposta vazia do Gemini')
  return text
}
