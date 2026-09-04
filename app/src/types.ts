export interface Questao {
  id: string
  exame: string
  materia: string
  numero: number
  enunciado: string
  alternativas: Record<'A' | 'B' | 'C' | 'D', string>
  resposta_correta: 'A' | 'B' | 'C' | 'D'
}

export interface BancoOAB {
  meta: {
    total_questoes: number
    examenes: string[]
    materias: string[]
  }
  questoes: Questao[]
}

export interface RespostaRegistro {
  questaoId: string
  selecionada: string
  correta: boolean
  modulo: 'flashcard' | 'simulado' | 'revisao'
  timestamp: number
  exame?: string
  materia?: string
}

export interface CustomCard {
  id: string
  titulo: string
  conteudo: string
  materia?: string
  criadoEm: number
}

export interface SimuladoResult {
  id: string
  exame: string
  acertos: number
  total: number
  tempoUsadoSeg: number
  finalizadoEm: number
  respostas: Record<string, string>
  /** IDs das 80 questões na ordem da prova */
  questaoIds?: string[]
}

export interface UserProgress {
  respostas: RespostaRegistro[]
  salvosRevisao: string[]
  customCards: CustomCard[]
  flashcardStreak: number
  flashcardLastDate: string
  simulados: SimuladoResult[]
}

export const STORAGE_KEY = 'oab-isabelly-progress-v1'
export const EXAM_DATE = new Date('2026-09-06T08:00:00')
export const SIMULADO_TOTAL = 80
export const SIMULADO_TEMPO_TOTAL = 5 * 60 * 60
export const TEMPO_POR_QUESTAO = 3 * 60 + 45
export const NOTA_APROVACAO = 40

export const defaultProgress = (): UserProgress => ({
  respostas: [],
  salvosRevisao: [],
  customCards: [],
  flashcardStreak: 0,
  flashcardLastDate: '',
  simulados: [],
})
