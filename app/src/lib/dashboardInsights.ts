import type { RespostaRegistro, UserProgress } from '../types'
import { questoesRespondidasHoje } from './cronograma'

export type ContinueHint = {
  label: string
  desc: string
  to: string
}

export type DashboardAlert = {
  tone: 'info' | 'warning' | 'success'
  message: string
  action?: { label: string; to: string }
}

export function lastActivity(respostas: RespostaRegistro[]): RespostaRegistro | undefined {
  if (!respostas.length) return undefined
  return [...respostas].sort((a, b) => b.timestamp - a.timestamp)[0]
}

export function continueWhereLeftOff(progress: UserProgress): ContinueHint | null {
  const last = lastActivity(progress.respostas)
  if (!last) {
    return {
      label: 'Começar pelos flashcards',
      desc: 'Ideal para a primeira sessão de estudo',
      to: '/app/flashcards',
    }
  }
  if (last.modulo === 'simulado' || progress.simulados.length > 0) {
    return {
      label: 'Continuar simulado',
      desc: 'Retome treino completo ou express',
      to: '/app/simulado',
    }
  }
  if (last.modulo === 'revisao') {
    return {
      label: 'Continuar revisão de erros',
      desc: last.materia ? `Última: ${last.materia}` : 'Fila automática de erros',
      to: '/app/revisao',
    }
  }
  return {
    label: 'Continuar flashcards',
    desc: last.materia ? `Última matéria: ${last.materia}` : 'Active recall rápido',
    to: '/app/flashcards',
  }
}

export function dashboardAlerts(params: {
  progress: UserProgress
  metaDiaria: number
  diasProva: number | null
  planExpiresAt: string | null
  isPro: boolean
}): DashboardAlert[] {
  const alerts: DashboardAlert[] = []
  const hoje = questoesRespondidasHoje(params.progress.respostas)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const ontem = questoesRespondidasHoje(params.progress.respostas, yesterday)

  if (params.diasProva != null && params.diasProva <= 14 && params.diasProva > 0) {
    alerts.push({
      tone: 'warning',
      message: `Faltam ${params.diasProva} dias para a prova — mantenha a meta diária.`,
      action: { label: 'Ver cronograma', to: '/app/cronograma' },
    })
  }

  if (params.metaDiaria > 0 && ontem < params.metaDiaria && hoje === 0) {
    alerts.push({
      tone: 'info',
      message: 'Ontem a meta não foi batida. Hoje é um bom dia para recuperar.',
      action: { label: 'Estudar agora', to: '/app/flashcards' },
    })
  }

  if (params.isPro && params.planExpiresAt) {
    const exp = new Date(params.planExpiresAt)
    const dias = Math.ceil((exp.getTime() - Date.now()) / 86400000)
    if (dias > 0 && dias <= 7) {
      alerts.push({
        tone: 'warning',
        message: `Seu plano Pro expira em ${dias} dia${dias === 1 ? '' : 's'}.`,
        action: { label: 'Renovar', to: '/planos' },
      })
    }
  }

  if (params.metaDiaria > 0 && hoje >= params.metaDiaria) {
    alerts.push({
      tone: 'success',
      message: 'Meta de hoje concluída. Parabéns!',
    })
  }

  return alerts
}

export type ActivityItem = {
  id: string
  title: string
  subtitle: string
  ts: number
  to: string
}

export function recentActivityItems(progress: UserProgress, limit = 5): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const s of progress.simulados.slice(0, 3)) {
    items.push({
      id: `sim-${s.id}`,
      title: `Simulado · ${s.exame}`,
      subtitle: `${s.acertos}/${s.total} acertos`,
      ts: s.finalizadoEm,
      to: '/app/simulado',
    })
  }

  for (const r of [...progress.respostas].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)) {
    if (r.modulo === 'flashcard' || r.modulo === 'revisao') {
      items.push({
        id: `r-${r.questaoId}-${r.timestamp}`,
        title: r.modulo === 'revisao' ? 'Revisão' : 'Flashcard',
        subtitle: `${r.materia ?? 'Questão'} · ${r.correta ? 'Acertou' : 'Errou'}`,
        ts: r.timestamp,
        to: r.modulo === 'revisao' ? '/app/revisao' : '/app/flashcards',
      })
    }
  }

  return items.sort((a, b) => b.ts - a.ts).slice(0, limit)
}
