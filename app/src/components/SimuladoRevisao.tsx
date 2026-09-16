import { useMemo, useState } from 'react'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconStar,
  IconStarOutline,
  IconTrophy,
  QuestionStatusIcon,
  QuestionStatusLabel,
} from './icons'
import TutorPanel from './TutorPanel'
import { formatTempo } from '../hooks/useAppData'
import { NOTA_APROVACAO, SIMULADO_TOTAL, type Questao, type SimuladoResult } from '../types'

type FiltroRevisao = 'erros' | 'todas' | 'nao-respondidas'

export function getSimuladoQuestoes(sim: SimuladoResult, questoes: Questao[]): Questao[] {
  const map = new Map(questoes.map((q) => [q.id, q]))

  if (sim.questaoIds?.length) {
    return sim.questaoIds.map((id) => map.get(id)).filter((q): q is Questao => Boolean(q))
  }

  return questoes
    .filter((q) => q.exame === sim.exame)
    .sort((a, b) => a.numero - b.numero)
    .slice(0, SIMULADO_TOTAL)
}

function statusQuestao(q: Questao, sel: string | undefined) {
  if (!sel) return 'nao-respondida' as const
  if (sel === q.resposta_correta) return 'acerto' as const
  return 'erro' as const
}

function formatarData(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SimuladoHistoricoLista({
  simulados,
  onAbrir,
}: {
  simulados: SimuladoResult[]
  onAbrir: (sim: SimuladoResult) => void
}) {
  if (simulados.length === 0) return null

  return (
    <section className="card rounded-2xl p-4">
      <h3 className="font-semibold text-ink">Histórico de simulados</h3>
      <p className="mt-1 text-xs text-muted">Toque para revisar erros e estudar questão por questão</p>
      <div className="mt-3 space-y-2">
        {simulados.map((s) => {
          const aprovada = s.acertos >= NOTA_APROVACAO
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onAbrir(s)}
              className="flex w-full items-center justify-between rounded-xl bg-surface-700 px-3 py-3 text-left transition active:scale-[0.99] hover:bg-surface-600"
            >
              <div className="min-w-0 pr-3">
                <p className="truncate font-medium text-ink">{s.exame}</p>
                <p className="text-xs text-muted">{formatarData(s.finalizadoEm)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-bold ${aprovada ? 'text-green-600' : 'text-yellow-600'}`}>
                  {s.acertos}/{s.total}
                </p>
                <p className="text-[10px] text-muted-light">{formatTempo(s.tempoUsadoSeg)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function SimuladoRevisaoDetalhe({
  sim,
  questoes,
  onVoltar,
  toggleSalvarRevisao,
  salvosRevisao,
}: {
  sim: SimuladoResult
  questoes: Questao[]
  onVoltar: () => void
  toggleSalvarRevisao: (id: string) => void
  salvosRevisao: string[]
}) {
  const [filtro, setFiltro] = useState<FiltroRevisao>('erros')
  const [questaoAtivaId, setQuestaoAtivaId] = useState<string | null>(null)

  const provaQuestoes = useMemo(() => getSimuladoQuestoes(sim, questoes), [sim, questoes])

  const stats = useMemo(() => {
    let erros = 0
    let naoRespondidas = 0
    provaQuestoes.forEach((q) => {
      const st = statusQuestao(q, sim.respostas[q.id])
      if (st === 'erro') erros++
      if (st === 'nao-respondida') naoRespondidas++
    })
    return { erros, naoRespondidas, acertos: sim.acertos }
  }, [provaQuestoes, sim])

  const filtradas = useMemo(() => {
    return provaQuestoes.filter((q) => {
      const st = statusQuestao(q, sim.respostas[q.id])
      if (filtro === 'erros') return st === 'erro' || st === 'nao-respondida'
      if (filtro === 'nao-respondidas') return st === 'nao-respondida'
      return true
    })
  }, [provaQuestoes, sim.respostas, filtro])

  const questaoAtiva = questaoAtivaId ? provaQuestoes.find((q) => q.id === questaoAtivaId) : null
  const indiceAtivo = questaoAtiva ? filtradas.findIndex((q) => q.id === questaoAtiva.id) : -1

  const aprovada = sim.acertos >= NOTA_APROVACAO

  if (questaoAtiva) {
    const sel = sim.respostas[questaoAtiva.id]
    const st = statusQuestao(questaoAtiva, sel)

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuestaoAtivaId(null)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-2 text-sm text-muted"
          >
            <IconArrowLeft size={16} />
            Lista
          </button>
          <p className="text-xs text-muted">
            {indiceAtivo + 1}/{filtradas.length} · Q{questaoAtiva.numero}
          </p>
        </div>

        <div className="card rounded-2xl p-4">
          <p className="text-xs font-medium text-brand-500">
            {questaoAtiva.materia} · {questaoAtiva.exame}
          </p>
          <p
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              st === 'acerto' ? 'bg-green-50 text-green-700' : st === 'erro' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
            }`}
          >
            <QuestionStatusLabel status={st} />
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink">{questaoAtiva.enunciado}</p>

          <div className="mt-4 space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((letra) => {
              const isCorreta = letra === questaoAtiva.resposta_correta
              const isSua = letra === sel
              return (
                <div
                  key={letra}
                  className={`rounded-xl border px-3 py-2.5 text-sm ${
                    isCorreta
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : isSua && !isCorreta
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : 'border-slate-200 bg-white text-ink'
                  }`}
                >
                  <span className="mr-2 font-bold text-brand-500">{letra})</span>
                  {questaoAtiva.alternativas[letra]}
                  {isCorreta && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600">
                      <IconCheck size={12} />
                      gabarito
                    </span>
                  )}
                  {isSua && !isCorreta && <span className="ml-2 text-xs text-red-600">sua resposta</span>}
                </div>
              )
            })}
          </div>
        </div>

        {(st === 'erro' || st === 'nao-respondida') && (
          <TutorPanel questao={questaoAtiva} respostaUsuario={sel ?? null} />
        )}

        <button
          type="button"
          onClick={() => toggleSalvarRevisao(questaoAtiva.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ${
            salvosRevisao.includes(questaoAtiva.id) ? 'bg-brand-50 text-brand-600' : 'bg-surface-700 text-muted'
          }`}
        >
          {salvosRevisao.includes(questaoAtiva.id) ? (
            <>
              <IconStar size={16} />
              Salva para revisão
            </>
          ) : (
            <>
              <IconStarOutline size={16} />
              Salvar para revisar depois
            </>
          )}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={indiceAtivo <= 0}
            onClick={() => setQuestaoAtivaId(filtradas[indiceAtivo - 1]?.id ?? null)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-700 py-2.5 text-sm text-ink disabled:opacity-30"
          >
            <IconArrowLeft size={16} />
            Anterior
          </button>
          <button
            type="button"
            disabled={indiceAtivo >= filtradas.length - 1}
            onClick={() => setQuestaoAtivaId(filtradas[indiceAtivo + 1]?.id ?? null)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
          >
            Próximo erro
            <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onVoltar}
        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-2 text-sm text-muted"
      >
        <IconArrowLeft size={16} />
        Voltar
      </button>

      <section className={`rounded-2xl p-5 text-center ${aprovada ? 'bg-green-50' : 'card'}`}>
        <p className="text-xs text-muted">{formatarData(sim.finalizadoEm)}</p>
        <h2 className="mt-1 text-xl font-bold text-ink">{sim.exame}</h2>
        <p className="mt-2 text-3xl font-extrabold text-ink">
          {sim.acertos}/{sim.total}
        </p>
        <p className={`mt-1 text-sm font-semibold ${aprovada ? 'text-green-600' : 'text-yellow-600'}`}>
          {aprovada ? 'Aprovada!' : `${NOTA_APROVACAO - sim.acertos} acertos faltando`}
        </p>
        <p className="mt-2 text-xs text-muted">
          {stats.erros} erros · {stats.naoRespondidas} em branco · {formatTempo(sim.tempoUsadoSeg)}
        </p>
      </section>

      <div className="flex gap-2">
        {(
          [
            ['erros', `Erros (${stats.erros + stats.naoRespondidas})`],
            ['nao-respondidas', `Em branco (${stats.naoRespondidas})`],
            ['todas', 'Todas'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFiltro(key)}
            className={`flex-1 rounded-xl py-2 text-xs font-medium ${
              filtro === key ? 'bg-brand-600 text-white' : 'bg-surface-700 text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtradas.length === 0 ? (
          <p className="flex items-center justify-center gap-2 py-8 text-center text-sm text-muted">
            <IconTrophy size={18} className="text-brand-500" />
            Nenhuma questão neste filtro
          </p>
        ) : (
          filtradas.map((q) => {
            const sel = sim.respostas[q.id]
            const st = statusQuestao(q, sel)
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setQuestaoAtivaId(q.id)}
                className={`w-full rounded-xl border p-3 text-left text-sm transition active:scale-[0.99] ${
                  st === 'acerto' ? 'border-green-200 bg-green-50' : st === 'erro' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <p className="flex flex-wrap items-center gap-1.5 font-medium text-ink">
                  Q{q.numero} · {q.materia}
                  <QuestionStatusIcon status={st} size={14} />
                  {sel ? ` · Sua: ${sel}` : ' · Em branco'} · Gabarito: {q.resposta_correta}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{q.enunciado}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-brand-500">
                  Toque para estudar
                  <IconArrowRight size={12} />
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
