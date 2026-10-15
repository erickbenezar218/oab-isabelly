import {
  geminiGenerate,
  geminiHealthProbe,
  geminiKeyHint,
  isGeminiConfigured,
  lastGeminiHealthHint,
  type GeminiMessage,
} from './gemini.js'
import {
  groqGenerate,
  groqHealthProbe,
  groqKeyHint,
  isGroqConfigured,
  lastGroqHealthDetail,
  lastGroqHealthHint,
  type GroqMessage,
} from './groq.js'

export type TutorLlmMessage = GeminiMessage | GroqMessage

/** Groq tem prioridade quando GROQ_API_KEY está definida. */
export function tutorLlmProvider(): 'groq' | 'gemini' | null {
  if (isGroqConfigured()) return 'groq'
  if (isGeminiConfigured()) return 'gemini'
  return null
}

export function isTutorLlmConfigured(): boolean {
  return tutorLlmProvider() !== null
}

export async function tutorLlmGenerate(
  systemPrompt: string,
  messages: TutorLlmMessage[],
  options?: { maxOutputTokens?: number },
): Promise<string> {
  if (isGroqConfigured()) return groqGenerate(systemPrompt, messages, options)
  if (isGeminiConfigured()) return geminiGenerate(systemPrompt, messages, options)
  throw new Error('LLM_NOT_CONFIGURED')
}

export async function tutorLlmHealthProbe(force = false): Promise<boolean> {
  if (isGroqConfigured()) return groqHealthProbe(force)
  if (isGeminiConfigured()) return geminiHealthProbe(force)
  return false
}

export function tutorLlmHealthHint(): string | undefined {
  if (isGroqConfigured()) return lastGroqHealthHint()
  return lastGeminiHealthHint()
}

export function tutorLlmHealthDetail(): string | undefined {
  if (isGroqConfigured()) return lastGroqHealthDetail()
  return undefined
}

export function tutorLlmKeyHint(): string | undefined {
  if (isGroqConfigured()) return groqKeyHint()
  return geminiKeyHint()
}
