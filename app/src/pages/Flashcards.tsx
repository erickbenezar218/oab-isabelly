import confetti from 'canvas-confetti'
import { useCallback, useMemo, useRef, useState } from 'react'
import { IconArrowRight, IconStar, IconStarOutline } from '../components/icons'
import PageHeader from '../components/ui/PageHeader'
import TutorPanel from '../components/TutorPanel'
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
  const [acertouUltima, setAcertouUltima] = useState<boolean | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

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
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 }, colors: ['#3c8f92', '#1c3f3a', '#5eead4', '#fff'] })
  }

  const avancar = useCallback(
    (direcao: 'left' | 'right') => {
      setSwipeClass(direcao === 'left' ? 'swipe-left' : 'swipe-right')
      setTimeout(() => {
        setIndex((i) => (i + 1 >= deck.length ? 0 : i + 1))
        setMostrarGabarito(false)
        setSelected(null)
        setAcertouUltima(null)
        setSwipeClass('')
      }, 280)
    },
    [deck.length],
  )

  const proximaQuestao = useCallback(() => {
    if (!mostrarGabarito) return
    avancar(acertouUltima ? 'right' : 'left')
  }, [acertouUltima, avancar, mostrarGabarito])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || !mostrarGabarito) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 80) {
      proximaQuestao()
    }
    touchStart.current = null
  }

  const escolherAlternativa = (letra: string) => {
    if (!atual || mostrarGabarito) return
    const acertou = letra === atual.resposta_correta
    setSelected(letra)
    setAcertouUltima(acertou)
    setMostrarGabarito(true)
    registrarResposta({
      questaoId: atual.id,
      selecionada: letra,
      correta: acertou,
      modulo: 'flashcard',
      timestamp: Date.now(),
      exame: atual.exame,
      materia: atual.materia,
    })
    updateStreak(acertou)
    if (acertou && progress.flashcardStreak + 1 >= 5) fireConfetti()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Flashcards"
        subtitle="Escolha a alternativa — o app marca certo ou errado sozinho e mostra a explicação."
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['materia', 'exame', 'revisao'] as FiltroTipo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setFiltroTipo(t)
              setFiltroValor('')
              setIndex(0)
              setMostrarGabarito(false)
              setSelected(null)
              setAcertouUltima(null)
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              filtroTipo === t ? 'bg-brand-600 text-white' : 'bg-surface-700 text-muted'
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
            setMostrarGabarito(false)
            setSelected(null)
            setAcertouUltima(null)
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none"
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
            setMostrarGabarito(false)
            setSelected(null)
            setAcertouUltima(null)
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none"
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
        <p className="py-12 text-center text-muted">
          {filtroTipo === 'revisao' ? 'Nenhuma questão salva para revisão ainda.' : 'Nenhuma questão no filtro.'}
        </p>
      ) : atual ? (
        <>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {atual.materia} · {atual.exame}
            </span>
            <span>
              {index + 1}/{deck.length}
            </span>
          </div>

          <div
            className={`card-swipe ${swipeClass} card rounded-2xl p-5`}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <p className="text-sm leading-relaxed text-ink">{atual.enunciado}</p>

            <div className="mt-4 space-y-2">
              {(['A', 'B', 'C', 'D'] as const).map((letra) => (
                <button
                  key={letra}
                  type="button"
                  disabled={mostrarGabarito}
                  onClick={() => escolherAlternativa(letra)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    mostrarGabarito && letra === atual.resposta_correta
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : mostrarGabarito && selected === letra && letra !== atual.resposta_correta
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : selected === letra
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-ink hover:border-brand-400 disabled:hover:border-slate-200'
                  }`}
                >
                  <span className="mr-2 font-bold text-brand-500">{letra})</span>
                  {atual.alternativas[letra]}
                </button>
              ))}
            </div>
          </div>

          {mostrarGabarito && selected && (
            <>
              <p
                className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                  acertouUltima ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {acertouUltima
                  ? 'Resposta correta!'
                  : `Resposta errada — gabarito ${atual.resposta_correta}.`}
              </p>
              {!acertouUltima && <TutorPanel questao={atual} respostaUsuario={selected} />}
              <button
                type="button"
                onClick={proximaQuestao}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white"
              >
                Próxima questão
                <IconArrowRight size={16} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => toggleSalvarRevisao(atual.id)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ${
              progress.salvosRevisao.includes(atual.id)
                ? 'bg-brand-50 text-brand-600'
                : 'bg-surface-700 text-muted'
            }`}
          >
            {progress.salvosRevisao.includes(atual.id) ? (
              <>
                <IconStar size={16} />
                Salvo para revisão
              </>
            ) : (
              <>
                <IconStarOutline size={16} />
                Salvar para revisar depois
              </>
            )}
          </button>

          {mostrarGabarito && (
            <p className="text-center text-[11px] text-muted-light">Deslize para a próxima questão</p>
          )}
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
