import { EXAM_DATE } from '../types'

/** Evita bug de fuso ao parsear YYYY-MM-DD */
export function parseExamDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Data padrão sugerida: ~4 meses à frente (sempre no futuro) */
export function defaultExamDateString(from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  d.setMonth(d.getMonth() + 4)
  if (d <= from) d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function resolveExamDate(examDateStr?: string): Date {
  if (examDateStr) return parseExamDate(examDateStr)
  if (EXAM_DATE.getTime() > Date.now()) return EXAM_DATE
  return parseExamDate(defaultExamDateString())
}

/** Dias até a prova. Negativo = data já passou. Zero = hoje. */
export function diasParaProva(date = new Date(), examDateStr?: string): number {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const exam = resolveExamDate(examDateStr)
  const examDay = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate())
  return Math.round((examDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatExamDatePt(examDateStr?: string): string {
  return resolveExamDate(examDateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export type ProvaCountdown =
  | { status: 'past'; dias: number; label: string }
  | { status: 'today'; dias: 0; label: string }
  | { status: 'future'; dias: number; label: string }

export function provaCountdown(examDateStr?: string, now = new Date()): ProvaCountdown {
  const dias = diasParaProva(now, examDateStr)
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
