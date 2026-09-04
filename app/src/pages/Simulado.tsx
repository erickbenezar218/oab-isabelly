import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatTempo } from '../hooks/useAppData'
import {
  NOTA_APROVACAO,
  SIMULADO_TEMPO_TOTAL,
  SIMULADO_TOTAL,
  TEMPO_POR_QUESTAO,
  type Questao,
  type SimuladoResult,
} from '../types'

type Fase = 'setup' | 'prova' | 'resultado'

export default function Simulado() {
  const { questoes, progress, loading, registrarResposta, saveSimulado, toggleSalvarRevisao } = useApp()
  const [fase, setFase] = useState<Fase>('setup')
  const [exameSelecionado, setExameSelecionado] = useState('')
  const [provaQuestoes, setProvaQuestoes] = useState<Questao[]>([])
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set())
  const [tempoGlobal, setTempoGlobal] = useState(SIMULADO_TEMPO_TOTAL)
  const [tempoQuestao, setTempoQuestao] = useState(0)
  const [inicioProva, setInicioProva] = useState(0)
  const [resultado, setResultado] = useState<SimuladoResult | null>(null)

  const exames = useMemo(() => {
    const map = new Map<string, Questao[]>()
    questoes.forEach((q) => {
      if (!map.has(q.exame)) map.set(q.exame, [])
      map.get(q.exame)!.push(q)
    })
    return [...map.entries()].filter(([, qs]) => qs.length >= SIMULADO_TOTAL)
  }, [questoes])

  const iniciar = () => {
    const pool = questoes.filter((q) => q.exame === exameSelecionado).sort((a, b) => a.numero - b.numero)
    const selecionadas = pool.slice(0, SIMULADO_TOTAL)
    setProvaQuestoes(selecionadas)
    setIndice(0)
    setRespostas({})
    setMarcadas(new Set())
    setTempoGlobal(SIMULADO_TEMPO_TOTAL)
    setTempoQuestao(0)
    setInicioProva(Date.now())
    setFase('prova')
  }

  const finalizar = useCallback(() => {
    let acertos = 0
    provaQuestoes.forEach((q) => {
      const sel = respostas[q.id]
      const ok = sel === q.resposta_correta
      if (ok) acertos++
      registrarResposta({
        questaoId: q.id,
        selecionada: sel ?? '',
        correta: ok,
        modulo: 'simulado',
        timestamp: Date.now(),
        exame: q.exame,
        materia: q.materia,
      })
    })
    const result: SimuladoResult = {
      id: crypto.randomUUID(),
      exame: exameSelecionado,
      acertos,
      total: provaQuestoes.length,
      tempoUsadoSeg: SIMULADO_TEMPO_TOTAL - tempoGlobal,
      finalizadoEm: Date.now(),
      respostas: { ...respostas },
    }
    saveSimulado(result)
    setResultado(result)
    setFase('resultado')
  }, [provaQuestoes, respostas, tempoGlobal, exameSelecionado, registrarResposta, saveSimulado])

  useEffect(() => {
    if (fase !== 'prova') return
    const t = setInterval(() => {
      setTempoGlobal((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          return 0
        }
        return prev - 1
      })
      setTempoQuestao((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [fase, indice])

  useEffect(() => {
    if (fase === 'prova' && tempoGlobal === 0) finalizar()
  }, [fase, tempoGlobal, finalizar])

  const questaoAtual = provaQuestoes[indice]
  const respondidas = Object.keys(respostas).length
  const tempoIdeal = (indice + 1) * TEMPO_POR_QUESTAO
  const tempoGasto = Math.floor((Date.now() - inicioProva) / 1000)
  const diffRitmo = tempoIdeal - tempoGasto
  const ritmoMsg =
    diffRitmo > 60
      ? `Você está ${formatTempo(diffRitmo)} adiantada! 🚀`
      : diffRitmo < -60
        ? `Você está ${formatTempo(Math.abs(diffRitmo))} atrasada ⏰`
        : 'Ritmo ideal! 👌'

  const tempoQuestaoCor = tempoQuestao > TEMPO_POR_QUESTAO ? 'text-red-400' : tempoQuestao > TEMPO_POR_QUESTAO * 0.85 ? 'text-yellow-400' : 'text-green-400'

  if (loading) return <Spinner />

  if (fase === 'setup') {
    return (
      <div className="space-y-5">
        <section className="rounded-2xl bg-surface-800 p-5">
          <h2 className="text-lg font-bold text-white">Simulado Realista OAB</h2>
          <p className="mt--2 text-sm text-purple-200/70">
            80 questões · 5 horas · meta 3min45s/questão · aprovação: {NOTA_APROVACAO}/80
          </p>
        </section>

        <label className="block">
          <span className="mb-2 block text-sm text-purple-200">Escolha o exame completo:</span>
          <select
            value={exameSelecionado}
            onChange={(e) => setExameSelecionado(e.target.value)}
            className="w-full rounded-xl bg-surface-700 px-3 py-3 text-white outline-none"
          >
            <option value="">Selecione...</option>
            {exames.map(([nome]) => (
              <option key={nome} value={nome}>
                {nome} (80 questões)
              </option>
            ))}
          </select>
        </label>

        {progress.simulados.length > 0 && (
          <div className="rounded-xl bg-surface-800 p-4">
            <p className="text-xs text-purple-300/60">Último simulado</p>
            <p className="font-semibold text-white">
              {progress.simulados[0].acertos}/{progress.simulados[0].total} —{' '}
              {progress.simulados[0].acertos >= NOTA_APROVACAO ? '✅ APROVADA!' : 'Continue! 💪'}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!exameSelecionado}
          onClick={iniciar}
          className="w-full rounded-xl bg-brand-600 py-4 font-bold text-white disabled:opacity-40"
        >
          Iniciar Simulado 📝
        </button>
      </div>
    )
  }

  if (fase === 'resultado' && resultado) {
    const aprovada = resultado.acertos >= NOTA_APROVACAO
    return (
      <div className="space-y-4">
        <section className={`rounded-2xl p-6 text-center ${aprovada ? 'bg-green-900/30' : 'bg-surface-800'}`}>
          <p className="text-4xl">{aprovada ? '🎉' : '💪'}</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {resultado.acertos}/{resultado.total}
          </h2>
          <p className={`mt-1 text-lg font-semibold ${aprovada ? 'text-green-400' : 'text-yellow-400'}`}>
            {aprovada ? 'APROVADA! Parabéns, Isabelly!' : `Faltam ${NOTA_APROVACAO - resultado.acertos} acertos para aprovação`}
          </p>
          <p className="mt-2 text-sm text-purple-200/60">Tempo: {formatTempo(resultado.tempoUsadoSeg)}</p>
        </section>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {provaQuestoes.map((q) => {
            const sel = resultado.respostas[q.id]
            const ok = sel === q.resposta_correta
            return (
              <div key={q.id} className={`rounded-xl p-3 text-sm ${ok ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <p className="font-medium text-white">
                  Q{q.numero} — {ok ? '✅' : '❌'} Gabarito: {q.resposta_correta}
                  {sel ? ` · Sua: ${sel}` : ' · Não respondida'}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-purple-200/60">{q.enunciado}</p>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setFase('setup')
            setResultado(null)
          }}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white"
        >
          Novo Simulado
        </button>
      </div>
    )
  }

  if (!questaoAtual) return null

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-30 space-y-2 rounded-xl bg-surface-800/95 p-3 backdrop-blur">
        <div className="flex justify-between text-xs">
          <span className="text-purple-300">⏱ Global: {formatTempo(tempoGlobal)}</span>
          <span className={tempoQuestaoCor}>Questão: {formatTempo(tempoQuestao)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${(respondidas / SIMULADO_TOTAL) * 100}%` }}
          />
        </div>
        <p className="text-center text-[11px] text-brand-200">{ritmoMsg}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {provaQuestoes.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setIndice(i)
              setTempoQuestao(0)
            }}
            className={`h-8 w-8 rounded-lg text-xs font-medium ${
              i === indice
                ? 'bg-brand-600 text-white'
                : marcadas.has(q.id)
                  ? 'bg-yellow-600/40 text-yellow-200'
                  : respostas[q.id]
                    ? 'bg-green-600/30 text-green-200'
                    : 'bg-surface-700 text-purple-300'
            }`}
          >
            {q.numero}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-800 p-4">
        <p className="text-xs text-brand-300">
          Questão {questaoAtual.numero}/80 · {questaoAtual.materia}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-purple-100">{questaoAtual.enunciado}</p>

        <div className="mt-4 space-y-2">
          {(['A', 'B', 'C', 'D'] as const).map((letra) => (
            <button
              key={letra}
              type="button"
              onClick={() => setRespostas((r) => ({ ...r, [questaoAtual.id]: letra }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm ${
                respostas[questaoAtual.id] === letra
                  ? 'border-brand-500 bg-brand-600/20 text-white'
                  : 'border-surface-600 bg-surface-700/50 text-purple-100'
              }`}
            >
              <span className="mr-2 font-bold text-brand-300">{letra})</span>
              {questaoAtual.alternativas[letra]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMarcadas((m) => {
              const n = new Set(m)
              if (n.has(questaoAtual.id)) n.delete(questaoAtual.id)
              else n.add(questaoAtual.id)
              return n
            })
            toggleSalvarRevisao(questaoAtual.id)
          }}
          className={`rounded-xl px-4 py-2.5 text-sm ${marcadas.has(questaoAtual.id) ? 'bg-yellow-600/30 text-yellow-200' : 'bg-surface-700 text-purple-200'}`}
        >
          🔖 Revisar
        </button>
        <button
          type="button"
          disabled={indice === 0}
          onClick={() => {
            setIndice((i) => i - 1)
            setTempoQuestao(0)
          }}
          className="flex-1 rounded-xl bg-surface-700 py-2.5 text-sm disabled:opacity-30"
        >
          ← Anterior
        </button>
        {indice < provaQuestoes.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              setIndice((i) => i + 1)
              setTempoQuestao(0)
            }}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
          >
            Próxima →
          </button>
        ) : (
          <button type="button" onClick={finalizar} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white">
            Finalizar ✓
          </button>
        )}
      </div>

      {marcadas.size > 0 && (
        <button
          type="button"
          onClick={() => {
            const next = provaQuestoes.findIndex((q, i) => i > indice && marcadas.has(q.id))
            const first = provaQuestoes.findIndex((q) => marcadas.has(q.id))
            setIndice(next >= 0 ? next : first)
            setTempoQuestao(0)
          }}
          className="w-full rounded-xl bg-yellow-600/20 py-2 text-sm text-yellow-200"
        >
          Ir para próxima marcada ({marcadas.size})
        </button>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}
