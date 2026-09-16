import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowLeft,
  IconArrowRight,
  IconBookmark,
  IconCircleCheck,
  IconClipboard,
  IconClock,
  IconRocket,
  IconCheck,
} from '../components/icons'
import PageHeader from '../components/ui/PageHeader'
import { SimuladoHistoricoLista, SimuladoRevisaoDetalhe } from '../components/SimuladoRevisao'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { formatTempo } from '../hooks/useAppData'
import { apiSimuladoStart } from '../lib/api'
import {
  NOTA_APROVACAO,
  SIMULADO_MODOS,
  SIMULADO_TOTAL,
  TEMPO_POR_QUESTAO,
  type Questao,
  type SimuladoModo,
  type SimuladoResult,
} from '../types'

type Fase = 'setup' | 'prova' | 'resultado' | 'historico'

export default function Simulado() {
  const { token, limits } = useAuth()
  const { questoes, progress, loading, registrarResposta, saveSimulado, toggleSalvarRevisao } = useApp()
  const [fase, setFase] = useState<Fase>('setup')
  const [limiteMsg, setLimiteMsg] = useState('')
  const [modo, setModo] = useState<SimuladoModo>('completo')
  const [exameSelecionado, setExameSelecionado] = useState('')
  const [provaQuestoes, setProvaQuestoes] = useState<Questao[]>([])
  const config = SIMULADO_MODOS[modo]
  const provaTotal = config.total
  const provaTempo = config.tempo
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set())
  const [tempoGlobal, setTempoGlobal] = useState(provaTempo)
  const [tempoQuestao, setTempoQuestao] = useState(0)
  const [inicioProva, setInicioProva] = useState(0)
  const [resultado, setResultado] = useState<SimuladoResult | null>(null)
  const [historicoSelecionado, setHistoricoSelecionado] = useState<SimuladoResult | null>(null)

  const exames = useMemo(() => {
    const map = new Map<string, Questao[]>()
    questoes.forEach((q) => {
      if (!map.has(q.exame)) map.set(q.exame, [])
      map.get(q.exame)!.push(q)
    })
    return [...map.entries()].filter(([, qs]) => qs.length >= (modo === 'express' ? 40 : SIMULADO_TOTAL))
  }, [questoes, modo])

  const iniciar = async () => {
    setLimiteMsg('')
    try {
      if (token) await apiSimuladoStart(token, config.apiMode)
    } catch (e) {
      setLimiteMsg(e instanceof Error ? e.message : 'Limite do plano atingido.')
      return
    }
    let pool = questoes.filter((q) => q.exame === exameSelecionado).sort((a, b) => a.numero - b.numero)
    let selecionadas: Questao[]
    if (modo === 'express') {
      selecionadas = [...pool].sort(() => Math.random() - 0.5).slice(0, provaTotal)
    } else {
      selecionadas = pool.slice(0, provaTotal)
    }
    setProvaQuestoes(selecionadas)
    setIndice(0)
    setRespostas({})
    setMarcadas(new Set())
    setTempoGlobal(provaTempo)
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
      tempoUsadoSeg: provaTempo - tempoGlobal,
      finalizadoEm: Date.now(),
      respostas: { ...respostas },
      questaoIds: provaQuestoes.map((q) => q.id),
    }
    saveSimulado(result)
    setResultado(result)
    setFase('resultado')
  }, [provaQuestoes, respostas, tempoGlobal, exameSelecionado, registrarResposta, saveSimulado, provaTempo])

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
  const ritmo =
    diffRitmo > 60
      ? { Icon: IconRocket, text: `Você está ${formatTempo(diffRitmo)} adiantada!` }
      : diffRitmo < -60
        ? { Icon: IconClock, text: `Você está ${formatTempo(Math.abs(diffRitmo))} atrasada` }
        : { Icon: IconCircleCheck, text: 'Ritmo ideal!' }
  const RitmoIcon = ritmo.Icon

  const tempoQuestaoCor = tempoQuestao > TEMPO_POR_QUESTAO ? 'text-red-400' : tempoQuestao > TEMPO_POR_QUESTAO * 0.85 ? 'text-yellow-400' : 'text-green-400'

  if (loading) return <Spinner />

  if (fase === 'setup') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Simulado realista"
          subtitle={`Aprovação: ${NOTA_APROVACAO}/80 · meta ~3min45s por questão`}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(SIMULADO_MODOS) as SimuladoModo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={`rounded-xl border p-3 text-left transition ${
                modo === m ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-sm font-semibold text-ink">{SIMULADO_MODOS[m].label}</p>
              <p className="mt-1 text-[10px] text-muted">{SIMULADO_MODOS[m].desc}</p>
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-muted">Escolha o exame completo:</span>
          <select
            value={exameSelecionado}
            onChange={(e) => setExameSelecionado(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-ink outline-none"
          >
            <option value="">Selecione...</option>
            {exames.map(([nome]) => (
              <option key={nome} value={nome}>
                {nome} ({modo === 'express' ? '40+' : '80'} questões)
              </option>
            ))}
          </select>
        </label>

        {limits && limits.plan === 'free' && (
          <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-700">
            Plano grátis: {limits.simuladosRestantesMes ?? 0} simulado(s) restante(s) este mês.{' '}
            <Link to="/planos" className="text-brand-600 underline">
              Ver Pro
            </Link>
          </p>
        )}

        {limiteMsg && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {limiteMsg}{' '}
            <Link to="/planos" className="underline">
              Assinar Pro
            </Link>
          </p>
        )}

        <SimuladoHistoricoLista
          simulados={progress.simulados}
          onAbrir={(s) => {
            setHistoricoSelecionado(s)
            setFase('historico')
          }}
        />

        {!limits?.historicoCompleto && progress.simulados.length > 0 && (
          <p className="text-center text-xs text-muted-light">
            Histórico completo disponível no plano Pro.{' '}
            <Link to="/planos" className="text-brand-500 underline">
              Upgrade
            </Link>
          </p>
        )}

        <button
          type="button"
          disabled={!exameSelecionado}
          onClick={() => void iniciar()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 font-bold text-white disabled:opacity-40"
        >
          <IconClipboard size={20} />
          Iniciar {config.label}
        </button>
      </div>
    )
  }

  if (fase === 'historico' && historicoSelecionado) {
    return (
      <SimuladoRevisaoDetalhe
        sim={historicoSelecionado}
        questoes={questoes}
        salvosRevisao={progress.salvosRevisao}
        toggleSalvarRevisao={toggleSalvarRevisao}
        onVoltar={() => {
          setHistoricoSelecionado(null)
          setFase('setup')
        }}
      />
    )
  }

  if (fase === 'resultado' && resultado) {
    return (
      <div className="space-y-4">
        <SimuladoRevisaoDetalhe
          sim={resultado}
          questoes={questoes}
          salvosRevisao={progress.salvosRevisao}
          toggleSalvarRevisao={toggleSalvarRevisao}
          onVoltar={() => {
            setResultado(null)
            setFase('setup')
          }}
        />
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
      <div className="sticky top-0 z-30 space-y-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-muted">
            <IconClock size={14} />
            Global: {formatTempo(tempoGlobal)}
          </span>
          <span className={`inline-flex items-center gap-1 ${tempoQuestaoCor}`}>
            <IconClock size={14} />
            Questão: {formatTempo(tempoQuestao)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${(respondidas / provaTotal) * 100}%` }}
          />
        </div>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-brand-500">
          <RitmoIcon size={14} />
          {ritmo.text}
        </p>
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
                  ? 'bg-yellow-100 text-yellow-800'
                  : respostas[q.id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-surface-700 text-muted'
            }`}
          >
            {q.numero}
          </button>
        ))}
      </div>

      <div className="card rounded-2xl p-4">
        <p className="text-xs font-medium text-brand-500">
          Questão {indice + 1}/{provaTotal} · {questaoAtual.materia}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink">{questaoAtual.enunciado}</p>

        <div className="mt-4 space-y-2">
          {(['A', 'B', 'C', 'D'] as const).map((letra) => (
            <button
              key={letra}
              type="button"
              onClick={() => setRespostas((r) => ({ ...r, [questaoAtual.id]: letra }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm ${
                respostas[questaoAtual.id] === letra
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-ink'
              }`}
            >
              <span className="mr-2 font-bold text-brand-500">{letra})</span>
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
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm ${marcadas.has(questaoAtual.id) ? 'bg-yellow-100 text-yellow-800' : 'bg-surface-700 text-muted'}`}
        >
          <IconBookmark size={16} />
          Revisar
        </button>
        <button
          type="button"
          disabled={indice === 0}
          onClick={() => {
            setIndice((i) => i - 1)
            setTempoQuestao(0)
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-700 py-2.5 text-sm text-ink disabled:opacity-30"
        >
          <IconArrowLeft size={16} />
          Anterior
        </button>
        {indice < provaQuestoes.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              setIndice((i) => i + 1)
              setTempoQuestao(0)
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
          >
            Próxima
            <IconArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={finalizar}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white"
          >
            <IconCheck size={16} />
            Finalizar
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
          className="w-full rounded-xl bg-yellow-50 py-2 text-sm text-yellow-800"
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
