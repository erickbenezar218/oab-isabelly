/** Limites do plano grátis — centralizados para API e documentação. */
export const FREE_LIMITS = {
  simuladosCompletosMes: 1,
  simuladosExpressMes: 1,
  flashcardsDia: 20,
  iaExplicacoesDia: 5,
  salvosRevisaoMax: 10,
  customCardsMax: 0,
} as const

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

type RespostaLike = { modulo?: string; timestamp?: number }

export function countFlashcardsToday(respostas: unknown[]): number {
  const key = todayKey()
  return (respostas as RespostaLike[]).filter(
    (r) => r.modulo === 'flashcard' && r.timestamp && new Date(r.timestamp).toISOString().slice(0, 10) === key,
  ).length
}
