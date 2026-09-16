export { diasParaProva, defaultExamDateString, formatExamDatePt, provaCountdown, resolveExamDate } from './examDate'

export function calcMetaDiaria(totalQuestoes: number, questoesRespondidas: number, diasRestantes: number) {
  const questoesRestantes = Math.max(0, totalQuestoes - questoesRespondidas)
  const dias = diasRestantes > 0 ? diasRestantes : 1
  const metaDiaria =
    diasRestantes <= 0 ? Math.max(1, Math.min(50, questoesRestantes || 20)) : Math.max(1, Math.ceil(questoesRestantes / dias))

  return { questoesRestantes, metaDiaria, diasRestantes }
}

export function questoesRespondidasHoje(respostas: { timestamp: number }[], date = new Date()): number {
  const key = date.toISOString().slice(0, 10)
  return respostas.filter((r) => new Date(r.timestamp).toISOString().slice(0, 10) === key).length
}

export function calcCenarios(totalQuestoes: number, questoesRespondidas: number, diasCenario: number[]) {
  const restantes = Math.max(0, totalQuestoes - questoesRespondidas)
  return diasCenario.map((dias) => ({
    dias,
    porDia: dias <= 0 ? restantes : Math.max(1, Math.ceil(restantes / dias)),
  }))
}
