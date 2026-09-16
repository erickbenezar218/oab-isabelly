import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TutorPanel from '../components/TutorPanel'
import { useApp } from '../context/AppContext'
import { questoesParaRevisao } from '../lib/revisao'
import type { Questao } from '../types'

export default function Revisao() {
  const { questoes, progress, loading, registrarResposta } = useApp()
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revelado, setRevelado] = useState(false)

  const fila = useMemo(() => questoesParaRevisao(questoes, progress.respostas), [questoes, progress.respostas])
  const atual = fila[idx]

  const confirmar = (letra: string) => {
    if (!atual || revelado) return
    setSelected(letra)
    setRevelado(true)
    registrarResposta({
      questaoId: atual.id,
      selecionada: letra,
      correta: letra === atual.resposta_correta,
      modulo: 'revisao',
      timestamp: Date.now(),
      exame: atual.exame,
      materia: atual.materia,
    })
  }

  const proximo = () => {
    setSelected(null)
    setRevelado(false)
    setIdx((i) => (fila.length ? (i + 1) % fila.length : 0))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!fila.length) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-4xl">🎯</p>
        <h1 className="mt-3 text-lg font-bold text-ink">Nada para revisar agora</h1>
        <p className="mt-2 text-sm text-muted">Erre questões nos flashcards ou simulados para montar sua fila automática.</p>
        <Link to="/app/flashcards" className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
          Ir aos flashcards
        </Link>
      </div>
    )
  }

  if (!atual) return null

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-xl font-bold text-ink">Revisão de erros</h1>
        <p className="mt-1 text-sm text-muted">
          Fila automática · {idx + 1}/{fila.length} questões erradas
        </p>
      </section>

      <QuestaoCard questao={atual} selected={selected} revelado={revelado} onSelect={confirmar} />

      {revelado && (
        <>
          <TutorPanel questao={atual} respostaUsuario={selected} />
          <button type="button" onClick={proximo} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white">
            Próximo erro →
          </button>
        </>
      )}
    </div>
  )
}

function QuestaoCard({
  questao,
  selected,
  revelado,
  onSelect,
}: {
  questao: Questao
  selected: string | null
  revelado: boolean
  onSelect: (letra: string) => void
}) {
  return (
    <article className="card rounded-2xl p-4">
      <p className="text-xs font-medium text-brand-500">{questao.materia} · {questao.exame}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink">{questao.enunciado}</p>
      <div className="mt-4 space-y-2">
        {(['A', 'B', 'C', 'D'] as const).map((letra) => {
          const isSel = selected === letra
          const ok = letra === questao.resposta_correta
          let cls = 'border-slate-200 bg-white hover:border-brand-300'
          if (revelado && ok) cls = 'border-green-400 bg-green-50'
          else if (revelado && isSel && !ok) cls = 'border-red-300 bg-red-50'
          else if (isSel) cls = 'border-brand-400 bg-brand-50'
          return (
            <button
              key={letra}
              type="button"
              disabled={revelado}
              onClick={() => onSelect(letra)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm ${cls}`}
            >
              <span className="mr-2 font-bold text-brand-500">{letra})</span>
              {questao.alternativas[letra]}
            </button>
          )
        })}
      </div>
    </article>
  )
}
