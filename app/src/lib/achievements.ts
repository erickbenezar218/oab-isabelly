import type { UserProgress } from '../types'
import { passariaHoje } from './gamification'

export type Badge = {
  id: string
  label: string
  earned: boolean
  desc: string
}

export function computeBadges(progress: UserProgress): Badge[] {
  const ultimoSim = progress.simulados[0]
  const passaria = ultimoSim ? passariaHoje(ultimoSim.acertos, ultimoSim.total) : false

  return [
    {
      id: 'first-answer',
      label: '1ª questão',
      earned: progress.respostas.length >= 1,
      desc: 'Respondeu a primeira questão',
    },
    {
      id: 'first-sim',
      label: '1º simulado',
      earned: progress.simulados.length >= 1,
      desc: 'Finalizou um simulado',
    },
    {
      id: 'streak-3',
      label: 'Sequência 3',
      earned: progress.flashcardStreak >= 3,
      desc: '3 acertos seguidos nos flashcards',
    },
    {
      id: 'streak-7',
      label: 'Sequência 7',
      earned: progress.flashcardStreak >= 7,
      desc: '7 acertos seguidos nos flashcards',
    },
    {
      id: 'passaria',
      label: 'Passaria hoje',
      earned: passaria,
      desc: 'Último simulado projetaria aprovação',
    },
    {
      id: '100-questions',
      label: '100 questões',
      earned: progress.respostas.length >= 100,
      desc: 'Centena de questões respondidas',
    },
  ]
}
