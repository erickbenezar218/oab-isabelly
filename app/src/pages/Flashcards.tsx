import confetti from 'canvas-confetti'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { shuffle } from '../hooks/useAppData'
import type { Questao } from '../types'

type FiltroTipo = 'materia' | 'exame' | 'revisao'

export default function Flashcards() {
  const { questoes, progress, loading, registrarResposta, toggleSalvarRevisao, updateStreak } = useApp()
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('materia')
  const [filtroValor, setFiltroValor] = useState('')
  const [index, setIndex] = useState(0)
  const [mostrarGabarito, setMostrarGabarito] = useState(false)
  const [swipeClass, setSwipeClass] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || !mostrarGabarito) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 80) {
      responder(dx > 0)
    }
    touchStart.current = null
  }

  const materias = useMemo(() => [...new Set(questoes.map((q) => q.materia))].sort(), [questoes])
  const exames = useMemo(() => [...new Set(questoes.map((q) => q.exame))].sort(), [questoes])

  const deck = useMemo(() => {
    let pool = [...questoes]
    if (filtroTipo === 'materia' && filtroValor) pool = pool.filter((q) => q.materia === filtroValor)
    if (filtroTipo === 'exame' && filtroValor) pool = pool.filter((q) => q.exame === filtroValor)
    if (filtroTipo === 'revisao') pool = pool.filter((q) => progress.salvosRevisao.includes(q.id))
    return shuffle(pool)
  }, [questoes, filtroTipo, filtroValor, progress.salvosRevisao])

  const atual: Questao | undefined = deck[index]

  const fireConfetti = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 }, colors: ['#e879f9', '#d946ef', '#f0abfc', '#fff'] })
  }

  const avancar = useCallback(
    (direcao: 'left' | 'right') => {
      setSwipeClass(direcao === 'left' ? 'swipe-left' : 'swipe-right')
      setTimeout(() => {
        setIndex((i) => (i + 1 >= deck.length ? 0 : i + 1))
        setMostrarGabarito(false)
        setSelected(null)
        setSwipeClass('')
      }, 280)
    },
    [deck.length],
  )

  const responder = (acertou: boolean) => {
    if (!atual) return
    registrarResposta({
      questaoId: atual.id,
      selecionada: selected ?? (acertou ? atual.resposta_correta : 'X'),
      correta: acertou,
      modulo: 'flashcard',
      timestamp: Date.now(),
      exame: atual.exame,
      materia: atual.materia,
    })
    updateStreak(acertou)
    if (acertou && progress.flashcardStreak + 1 >= 5) fireConfetti()
    avancar(acertou ? 'right' : 'left')
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['materia', 'exame', 'revisao'] as FiltroTipo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setFiltroTipo(t)
              setFiltroValor('')
              setIndex(0)
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              filtroTipo === t ? 'bg-brand-600 text-white' : 'bg-surface-700 text-purple-200'
            }`}
          >
            {t === 'materia' ? 'Matéria' : t === 'exame' ? 'Exame' : 'Revisão'}
          </button>
        ))}
      </div>

      {filtroTipo === 'materia' && (
        <select
          value={filtroValor}
          onChange={(e) => {
            setFiltroValor(e.target.value)
            setIndex(0)
          }}
          className="w-full rounded-xl bg-surface-700 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">Todas as matérias</option>
          {materias.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}

      {filtroTipo === 'exame' && (
        <select
          value={filtroValor}
          onChange={(e) => {
            setFiltroValor(e.target.value)
            setIndex(0)
          }}
          className="w-full rounded-xl bg-surface-700 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">Todos os exames</option>
          {exames.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      )}

      {deck.length === 0 ? (
        <p className="py-12 text-center text-purple-300/60">
          {filtroTipo === 'revisao' ? 'Nenhuma questão salva para revisão ainda.' : 'Nenhuma questão no filtro.'}
        </p>
      ) : atual ? (
        <>
          <div className="flex items-center justify-between text-xs text-purple-300/60">
            <span>
              {atual.materia} · {atual.exame}
            </span>
            <span>
              {index + 1}/{deck.length}
            </span>
          </div>

          <div
            className={`card-swipe ${swipeClass} rounded-2xl bg-surface-800 p-5 shadow-lg`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <p className="text-sm leading-relaxed text-purple-100">{atual.enunciado}</p>

            <div className="mt-4 space-y-2">
              {(['A', 'B', 'C', 'D'] as const).map((letra) => (
                <button
                  key={letra}
                  type="button"
                  onClick={() => {
                    setSelected(letra)
                    setMostrarGabarito(true)
                  }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    mostrarGabarito && letra === atual.resposta_correta
                      ? 'border-green-500/50 bg-green-500/10 text-green-300'
                      : mostrarGabarito && selected === letra && letra !== atual.resposta_correta
                        ? 'border-red-500/50 bg-red-500/10 text-red-300'
                        : selected === letra
                          ? 'border-brand-500 bg-brand-600/20 text-white'
                          : 'border-surface-600 bg-surface-700/50 text-purple-100 hover:border-brand-600/50'
                  }`}
                >
                  <span className="mr-2 font-bold text-brand-300">{letra})</span>
                  {atual.alternativas[letra]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={!mostrarGabarito}
              onClick={() => responder(false)}
              className="flex-1 rounded-xl bg-red-600/80 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              ❌ Errei / Revisar
            </button>
            <button
              type="button"
              disabled={!mostrarGabarito}
              onClick={() => responder(selected === atual.resposta_correta)}
              className="flex-1 rounded-xl bg-green-600/80 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              ✅ Acertei / Dominei
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleSalvarRevisao(atual.id)}
            className={`w-full rounded-xl py-2.5 text-sm font-medium ${
              progress.salvosRevisao.includes(atual.id)
                ? 'bg-brand-600/30 text-brand-200'
                : 'bg-surface-700 text-purple-200'
            }`}
          >
            {progress.salvosRevisao.includes(atual.id) ? '⭐ Salvo para revisão' : '☆ Salvar para revisar depois'}
          </button>

          <p className="text-center text-[11px] text-purple-400/50">Deslize ← erro · → acerto (após revelar gabarito)</p>
        </>
      ) : null}
    </div>
  )
}

function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}
