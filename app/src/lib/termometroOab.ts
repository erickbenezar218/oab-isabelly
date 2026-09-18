import { NOTA_APROVACAO, SIMULADO_TOTAL } from '../types'

export type TermometroFonte = 'simulado' | 'geral' | 'sem_dados'

export type TermometroOab = {
  /** Projeção de acertos em 80 questões (0–80). */
  score: number
  /** Preenchimento visual do termômetro (0–100). */
  pct: number
  label: string
  passaria: boolean
  fonte: TermometroFonte
  detail: string
}

function zona(score: number): { label: string; passaria: boolean } {
  if (score >= NOTA_APROVACAO) return { label: 'Aprovado!', passaria: true }
  if (score >= 30) return { label: 'Quente', passaria: false }
  if (score >= 20) return { label: 'Esquentando', passaria: false }
  return { label: 'Frio', passaria: false }
}

function projeta(acertos: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((acertos / total) * SIMULADO_TOTAL)
}

/** Termômetro OAB — projeção de aprovação com base no último simulado ou no desempenho geral. */
export function calcTermometroOab(params: {
  ultimoSimulado?: { acertos: number; total: number } | null
  totalRespondidas: number
  acertos: number
}): TermometroOab {
  const { ultimoSimulado, totalRespondidas, acertos } = params

  if (ultimoSimulado && ultimoSimulado.total >= 20) {
    const score = projeta(ultimoSimulado.acertos, ultimoSimulado.total)
    const { label, passaria } = zona(score)
    return {
      score,
      pct: Math.min(100, Math.round((score / SIMULADO_TOTAL) * 100)),
      label,
      passaria,
      fonte: 'simulado',
      detail: `Último simulado: ${ultimoSimulado.acertos}/${ultimoSimulado.total} → projeção ${score}/${SIMULADO_TOTAL}`,
    }
  }

  if (totalRespondidas >= 30) {
    const score = projeta(acertos, totalRespondidas)
    const { label, passaria } = zona(score)
    return {
      score,
      pct: Math.min(100, Math.round((score / SIMULADO_TOTAL) * 100)),
      label,
      passaria,
      fonte: 'geral',
      detail: `Desempenho geral: ${Math.round((acertos / totalRespondidas) * 100)}% em ${totalRespondidas} questões`,
    }
  }

  if (totalRespondidas >= 10) {
    const score = projeta(acertos, totalRespondidas)
    const { label, passaria } = zona(score)
    return {
      score,
      pct: Math.min(100, Math.round((score / SIMULADO_TOTAL) * 100)),
      label,
      passaria,
      fonte: 'geral',
      detail: `Estimativa preliminar — faça um simulado para refinar (${totalRespondidas} questões)`,
    }
  }

  return {
    score: 0,
    pct: 8,
    label: 'Sem dados',
    passaria: false,
    fonte: 'sem_dados',
    detail: 'Responda flashcards ou faça um simulado para ativar o termômetro',
  }
}

export function termometroCor(pct: number, passaria: boolean): string {
  if (passaria) return '#22c55e'
  if (pct >= 38) return '#f59e0b'
  if (pct >= 25) return '#fb923c'
  return '#ef4444'
}
