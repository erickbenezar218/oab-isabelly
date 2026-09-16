import { Link } from 'react-router-dom'
import ProGate from '../components/ProGate'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { calcCenarios, calcMetaDiaria, diasParaProva, questoesRespondidasHoje } from '../lib/cronograma'
import { gerarTrilha } from '../lib/trilha'
import { EXAM_DATE } from '../types'

export default function Cronograma() {
  const { questoes, meta, progress, loading } = useApp()
  const { limits, user } = useAuth()
  const isPro = limits?.cronograma ?? user?.plan === 'pro'

  if (!isPro) {
    return (
      <ProGate
        emoji="📅"
        title="Cronograma de meta diária"
        description="Com base nos dias até a prova, calculamos quantas questões você precisa fazer por dia para cobrir todo o banco. Disponível no plano Pro."
      />
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const total = meta?.total_questoes ?? questoes.length
  const respondidas = progress.respostas.length
  const examDate = progress.profile?.examDate
  const dias = diasParaProva(new Date(), examDate)
  const hoje = questoesRespondidasHoje(progress.respostas)
  const { questoesRestantes, metaDiaria } = calcMetaDiaria(total, respondidas, dias)
  const trilha = gerarTrilha({ totalQuestoes: total, respostas: progress.respostas, examDate })
  const pctHoje = metaDiaria > 0 ? Math.min(100, Math.round((hoje / metaDiaria) * 100)) : 100
  const cenarios = calcCenarios(total, respondidas, [dias, 60, 30, 20, 10].filter((d, i, arr) => arr.indexOf(d) === i))

  const dataProva = EXAM_DATE.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-xl font-bold text-ink">Meta diária</h1>
        <p className="mt-1 text-sm text-muted">
          Próxima prova objetiva em {dataProva} · mínimo 40 acertos em 80 questões
        </p>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 text-white">
        <p className="text-sm font-medium text-brand-100">
          {dias === 0 ? 'Prova hoje!' : `Faltam ${dias} dias`}
        </p>
        <p className="mt-2 text-4xl font-extrabold">{metaDiaria}</p>
        <p className="text-sm text-brand-100">questões por dia para cobrir o banco</p>
        <p className="mt-3 text-xs text-white/80">
          {questoesRestantes} restantes de {total} · {respondidas} já feitas
        </p>
      </section>

      <section className="card rounded-2xl p-4">
        <h2 className="mb-3 font-semibold text-ink">Trilha inteligente de hoje</h2>
        <ul className="space-y-2">
          {trilha.tarefas.map((t) => (
            <li key={t.tipo} className="flex items-center justify-between rounded-xl bg-surface-700 px-3 py-2.5 text-sm">
              <span>{t.label}</span>
              <Link to={t.link} className="font-semibold text-brand-600">{t.qtd}{t.tipo === 'sim' ? ' questões' : ''} →</Link>
            </li>
          ))}
        </ul>
        {trilha.materiaFraca && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Reforce: <strong>{trilha.materiaFraca}</strong> — pior desempenho nas suas estatísticas.
          </p>
        )}
      </section>

      <section className="card rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Progresso de hoje</h2>
          <span className={`text-sm font-bold ${pctHoje >= 100 ? 'text-green-600' : 'text-brand-600'}`}>
            {hoje}/{metaDiaria}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-700">
          <div
            className={`h-full rounded-full transition-all ${pctHoje >= 100 ? 'bg-green-500' : 'bg-brand-500'}`}
            style={{ width: `${pctHoje}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {pctHoje >= 100
            ? 'Meta do dia batida! 🎯'
            : `Faltam ${Math.max(0, metaDiaria - hoje)} questões para bater a meta hoje.`}
        </p>
        <div className="mt-4 flex gap-2">
          <Link to="/app/flashcards" className="flex-1 rounded-xl bg-brand-50 py-2.5 text-center text-xs font-semibold text-brand-700">
            Flashcards
          </Link>
          <Link to="/app/simulado" className="flex-1 rounded-xl bg-brand-600 py-2.5 text-center text-xs font-semibold text-white">
            Simulado
          </Link>
        </div>
      </section>

      <section className="card rounded-2xl p-4">
        <h2 className="mb-3 font-semibold text-ink">Cenários por prazo</h2>
        <p className="mb-4 text-xs text-muted">
          Quantas questões por dia se você tivesse X dias até a prova (com o progresso atual).
        </p>
        <div className="space-y-2">
          {cenarios.map(({ dias: d, porDia }) => (
            <div
              key={d}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${d === dias ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-surface-700'}`}
            >
              <span className="text-sm text-ink">
                {d === 0 ? 'Hoje (prova)' : `${d} dias`}
                {d === dias && <span className="ml-2 text-[10px] font-semibold text-brand-600">SEU PRAZO</span>}
              </span>
              <span className="text-sm font-bold text-brand-600">{porDia}/dia</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-2xl p-4">
        <h2 className="mb-2 font-semibold text-ink">Dica de estudo</h2>
        <p className="text-sm leading-relaxed text-muted">
          Alterne flashcards (volume) com simulados (ritmo de prova). Se faltam poucos dias, priorize matérias
          com pior desempenho na aba Desempenho.
        </p>
      </section>
    </div>
  )
}
