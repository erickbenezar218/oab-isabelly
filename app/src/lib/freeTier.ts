/** Espelha api/src/freeLimits.ts para UI. */
export const FREE_TIER = {
  simuladosCompletosMes: 1,
  simuladosExpressMes: 1,
  flashcardsDia: 20,
  iaExplicacoesDia: 5,
  salvosRevisaoMax: 10,
} as const

export function flashcardsRespondidosHoje(respostas: { modulo: string; timestamp: number }[]): number {
  const key = new Date().toISOString().slice(0, 10)
  return respostas.filter(
    (r) => r.modulo === 'flashcard' && new Date(r.timestamp).toISOString().slice(0, 10) === key,
  ).length
}
