export { diasParaProva, formatExamDatePt, provaCountdown, suggestedExamDateString } from './examDate'

export function calcMetaDiaria(
  totalQuestoes: number,
  questoesRespondidas: number,
  diasRestantes: number,
  dailyGoalOverride?: number | null,
) {
  const questoesRestantes = Math.max(0, totalQuestoes - questoesRespondidas)
  const dias = diasRestantes > 0 ? diasRestantes : 1
  const autoMeta =
    diasRestantes <= 0 ? Math.max(1, Math.min(50, questoesRestantes || 20)) : Math.max(1, Math.ceil(questoesRestantes / dias))
  const metaDiaria =
    dailyGoalOverride != null && dailyGoalOverride > 0 ? dailyGoalOverride : autoMeta

  return { questoesRestantes, metaDiaria, diasRestantes, autoMeta }
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
