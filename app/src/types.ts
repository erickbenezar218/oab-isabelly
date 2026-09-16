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

export interface PecasResposta {
  casoId: string
  selecionada: string
  correta: boolean
  timestamp: number
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

export interface UserProfile {
  examDate?: string
  area2fase?: string
  onboardingDone?: boolean
  welcomeTourDone?: boolean
}

export interface UserProgress {
  respostas: RespostaRegistro[]
  salvosRevisao: string[]
  customCards: CustomCard[]
  flashcardStreak: number
  flashcardLastDate: string
  simulados: SimuladoResult[]
  pecasRespostas: PecasResposta[]
  profile: UserProfile
  iaUsageToday?: { date: string; count: number }
}

export const STORAGE_KEY = 'simulaordem-progress-v1'
export const EXAM_DATE = new Date('2026-09-06T08:00:00')
export const SIMULADO_TOTAL = 80
export const SIMULADO_EXPRESS_TOTAL = 40
export const SIMULADO_TEMPO_TOTAL = 5 * 60 * 60
export const SIMULADO_EXPRESS_TEMPO = 60 * 60
export const TEMPO_POR_QUESTAO = 3 * 60 + 45
export const NOTA_APROVACAO = 40

export type SimuladoModo = 'completo' | 'express' | 'prova'

export const SIMULADO_MODOS: Record<
  SimuladoModo,
  { total: number; tempo: number; label: string; desc: string; apiMode: 'full' | 'express' }
> = {
  completo: {
    total: SIMULADO_TOTAL,
    tempo: SIMULADO_TEMPO_TOTAL,
    label: 'Completo',
    desc: '80 questões · 5 horas · sorteadas do exame',
    apiMode: 'full',
  },
  express: {
    total: SIMULADO_EXPRESS_TOTAL,
    tempo: SIMULADO_EXPRESS_TEMPO,
    label: 'Express',
    desc: '40 questões · 1 hora · não conta no limite mensal',
    apiMode: 'express',
  },
  prova: {
    total: SIMULADO_TOTAL,
    tempo: SIMULADO_TEMPO_TOTAL,
    label: 'Prova oficial',
    desc: '80 questões na ordem real do exame',
    apiMode: 'full',
  },
}

export const defaultProgress = (): UserProgress => ({
  respostas: [],
  salvosRevisao: [],
  customCards: [],
  flashcardStreak: 0,
  flashcardLastDate: '',
  simulados: [],
  pecasRespostas: [],
  profile: {},
})
