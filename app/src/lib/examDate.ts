/** Evita bug de fuso ao parsear YYYY-MM-DD */
export function parseExamDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Próxima edição usual da OAB — só sugere no formulário, não entra na contagem sem cadastro */
export const SUGGESTED_EXAM_DATE = '2027-02-22'

export function suggestedExamDateString(): string {
  return SUGGESTED_EXAM_DATE
}

/** Dias até a prova. null = sem data cadastrada. Negativo = passou. */
export function diasParaProva(date = new Date(), examDateStr?: string | null): number | null {
  if (!examDateStr) return null
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const exam = parseExamDate(examDateStr)
  const examDay = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate())
  return Math.round((examDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatExamDatePt(examDateStr?: string | null): string {
  if (!examDateStr) return 'Não definida'
  return parseExamDate(examDateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export type ProvaCountdown =
  | { status: 'unset'; label: string }
  | { status: 'past'; dias: number; label: string }
  | { status: 'today'; dias: 0; label: string }
  | { status: 'future'; dias: number; label: string }

export function provaCountdown(examDateStr?: string | null, now = new Date()): ProvaCountdown {
  if (!examDateStr) {
    return { status: 'unset', label: 'Cadastre a data da sua prova' }
  }
  const dias = diasParaProva(now, examDateStr)!
  if (dias < 0) {
    return {
      status: 'past',
      dias,
      label: 'A data da prova já passou — atualize abaixo',
    }
  }
  if (dias === 0) {
    return { status: 'today', dias: 0, label: 'Prova hoje — boa sorte!' }
  }
  return { status: 'future', dias, label: `Faltam ${dias} dias para a prova` }
}
