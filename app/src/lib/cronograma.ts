import { EXAM_DATE } from '../types'

export function diasParaProva(date = new Date(), examDateStr?: string): number {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const examSrc = examDateStr ? new Date(examDateStr) : EXAM_DATE
  const exam = new Date(examSrc.getFullYear(), examSrc.getMonth(), examSrc.getDate())
  const diff = exam.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function calcMetaDiaria(totalQuestoes: number, questoesRespondidas: number, diasRestantes: number) {
  const questoesRestantes = Math.max(0, totalQuestoes - questoesRespondidas)
  const dias = Math.max(1, diasRestantes || 1)
  const metaDiaria = diasRestantes === 0 ? questoesRestantes : Math.max(1, Math.ceil(questoesRestantes / dias))

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
