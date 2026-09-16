import { calcMetaDiaria, diasParaProva } from './cronograma'

export interface TrilhaDia {
  metaQuestoes: number
  feitasHoje: number
  tarefas: { tipo: string; label: string; qtd: number; link: string }[]
  materiaFraca: string | null
}

export function gerarTrilha(params: {
  totalQuestoes: number
  respostas: { materia?: string; correta: boolean; timestamp: number }[]
  examDate?: string
}): TrilhaDia {
  const rawDias = params.examDate ? diasParaProva(new Date(), params.examDate) : null
  const dias = rawDias != null && rawDias > 0 ? rawDias : 30

  const respondidas = params.respostas.length
  const { metaDiaria } = calcMetaDiaria(params.totalQuestoes, respondidas, dias)

  const hojeKey = new Date().toISOString().slice(0, 10)
  const feitasHoje = params.respostas.filter((r) => new Date(r.timestamp).toISOString().slice(0, 10) === hojeKey).length

  const porMateria = new Map<string, { total: number; acertos: number }>()
  for (const r of params.respostas) {
    if (!r.materia) continue
    const cur = porMateria.get(r.materia) ?? { total: 0, acertos: 0 }
    cur.total++
    if (r.correta) cur.acertos++
    porMateria.set(r.materia, cur)
  }

  let materiaFraca: string | null = null
  let piorPct = 101
  for (const [m, s] of porMateria) {
    if (s.total < 3) continue
    const pct = (s.acertos / s.total) * 100
    if (pct < piorPct) {
      piorPct = pct
      materiaFraca = m
    }
  }

  const flash = Math.ceil(metaDiaria * 0.5)
  const revisao = Math.max(0, Math.ceil(metaDiaria * 0.2))
  const simuladoExpress = metaDiaria > 15 ? 1 : 0

  const tarefas = [
    { tipo: 'flash', label: 'Flashcards', qtd: flash, link: '/app/flashcards' },
    ...(materiaFraca
      ? [{ tipo: 'foco', label: `Foco: ${materiaFraca.split(' ').slice(0, 2).join(' ')}`, qtd: Math.ceil(metaDiaria * 0.3), link: '/app/flashcards' }]
      : []),
    { tipo: 'revisao', label: 'Revisar erros', qtd: revisao, link: '/app/revisao' },
    ...(simuladoExpress ? [{ tipo: 'sim', label: 'Simulado express', qtd: 40, link: '/app/simulado' }] : []),
    { tipo: 'peca', label: 'Peça 2ª fase', qtd: 2, link: '/app/pecas' },
  ]

  return { metaQuestoes: metaDiaria, feitasHoje, tarefas, materiaFraca }
}
