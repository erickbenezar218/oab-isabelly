import type { Questao, RespostaRegistro } from '../types'

export function questoesParaRevisao(questoes: Questao[], respostas: RespostaRegistro[]): Questao[] {
  const lastById = new Map<string, RespostaRegistro>()
  for (const r of respostas) {
    const prev = lastById.get(r.questaoId)
    if (!prev || r.timestamp > prev.timestamp) lastById.set(r.questaoId, r)
  }

  const erros = [...lastById.values()]
    .filter((r) => !r.correta)
    .sort((a, b) => a.timestamp - b.timestamp)

  const ids = new Set(erros.map((e) => e.questaoId))
  const map = new Map(questoes.map((q) => [q.id, q]))
  return [...ids].map((id) => map.get(id)).filter(Boolean) as Questao[]
}
