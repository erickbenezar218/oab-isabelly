import { useMemo, useState } from 'react'
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
    <section className="rounded-2xl bg-surface-800 p-4">
      <h3 className="font-semibold text-white">Histórico de simulados</h3>
      <p className="mt-1 text-xs text-purple-300/60">Toque para revisar erros e estudar questão por questão</p>
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
                <p className="truncate font-medium text-white">{s.exame}</p>
                <p className="text-xs text-purple-300/60">{formatarData(s.finalizadoEm)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-bold ${aprovada ? 'text-green-400' : 'text-yellow-400'}`}>
                  {s.acertos}/{s.total}
                </p>
                <p className="text-[10px] text-purple-400/50">{formatTempo(s.tempoUsadoSeg)}</p>
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
          <button type="button" onClick={() => setQuestaoAtivaId(null)} className="rounded-lg bg-surface-700 px-3 py-2 text-sm text-purple-200">
            ← Lista
          </button>
          <p className="text-xs text-purple-300/60">
            {indiceAtivo + 1}/{filtradas.length} · Q{questaoAtiva.numero}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-800 p-4">
          <p className="text-xs text-brand-300">
            {questaoAtiva.materia} · {questaoAtiva.exame}
          </p>
          <p
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              st === 'acerto' ? 'bg-green-500/20 text-green-300' : st === 'erro' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {st === 'acerto' ? '✅ Acertou' : st === 'erro' ? '❌ Errou' : '⚠️ Não respondida'}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-purple-100">{questaoAtiva.enunciado}</p>

          <div className="mt-4 space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((letra) => {
              const isCorreta = letra === questaoAtiva.resposta_correta
              const isSua = letra === sel
              return (
                <div
                  key={letra}
                  className={`rounded-xl border px-3 py-2.5 text-sm ${
                    isCorreta
                      ? 'border-green-500/50 bg-green-500/10 text-green-200'
                      : isSua && !isCorreta
                        ? 'border-red-500/50 bg-red-500/10 text-red-200'
                        : 'border-surface-600 bg-surface-700/50 text-purple-100'
                  }`}
                >
                  <span className="mr-2 font-bold text-brand-300">{letra})</span>
                  {questaoAtiva.alternativas[letra]}
                  {isCorreta && <span className="ml-2 text-xs text-green-400">✓ gabarito</span>}
                  {isSua && !isCorreta && <span className="ml-2 text-xs text-red-400">sua resposta</span>}
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleSalvarRevisao(questaoAtiva.id)}
          className={`w-full rounded-xl py-2.5 text-sm font-medium ${
            salvosRevisao.includes(questaoAtiva.id) ? 'bg-brand-600/30 text-brand-200' : 'bg-surface-700 text-purple-200'
          }`}
        >
          {salvosRevisao.includes(questaoAtiva.id) ? '⭐ Salva para revisão' : '☆ Salvar para revisar depois'}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={indiceAtivo <= 0}
            onClick={() => setQuestaoAtivaId(filtradas[indiceAtivo - 1]?.id ?? null)}
            className="flex-1 rounded-xl bg-surface-700 py-2.5 text-sm disabled:opacity-30"
          >
            ← Anterior
          </button>
          <button
            type="button"
            disabled={indiceAtivo >= filtradas.length - 1}
            onClick={() => setQuestaoAtivaId(filtradas[indiceAtivo + 1]?.id ?? null)}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
          >
            Próximo erro →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={onVoltar} className="rounded-lg bg-surface-700 px-3 py-2 text-sm text-purple-200">
        ← Voltar
      </button>

      <section className={`rounded-2xl p-5 text-center ${aprovada ? 'bg-green-900/30' : 'bg-surface-800'}`}>
        <p className="text-xs text-purple-300/60">{formatarData(sim.finalizadoEm)}</p>
        <h2 className="mt-1 text-xl font-bold text-white">{sim.exame}</h2>
        <p className="mt-2 text-3xl font-extrabold text-white">
          {sim.acertos}/{sim.total}
        </p>
        <p className={`mt-1 text-sm font-semibold ${aprovada ? 'text-green-400' : 'text-yellow-400'}`}>
          {aprovada ? 'Aprovada!' : `${NOTA_APROVACAO - sim.acertos} acertos faltando`}
        </p>
        <p className="mt-2 text-xs text-purple-300/60">
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
              filtro === key ? 'bg-brand-600 text-white' : 'bg-surface-700 text-purple-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtradas.length === 0 ? (
          <p className="py-8 text-center text-sm text-purple-300/60">Nenhuma questão neste filtro 🎉</p>
        ) : (
          filtradas.map((q) => {
            const sel = sim.respostas[q.id]
            const st = statusQuestao(q, sel)
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setQuestaoAtivaId(q.id)}
                className={`w-full rounded-xl p-3 text-left text-sm transition active:scale-[0.99] ${
                  st === 'acerto' ? 'bg-green-500/10' : st === 'erro' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                }`}
              >
                <p className="font-medium text-white">
                  Q{q.numero} · {q.materia} — {st === 'acerto' ? '✅' : st === 'erro' ? '❌' : '⚠️'}
                  {sel ? ` · Sua: ${sel}` : ' · Em branco'} · Gabarito: {q.resposta_correta}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-purple-200/60">{q.enunciado}</p>
                <p className="mt-1 text-xs text-brand-300">Toque para estudar →</p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
