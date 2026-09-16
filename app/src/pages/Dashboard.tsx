import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { calcMetaDiaria, diasParaProva, questoesRespondidasHoje } from '../lib/cronograma'
import { levelFromXp, calcXp, passariaHoje } from '../lib/gamification'
import { gerarTrilha } from '../lib/trilha'

export default function Dashboard() {
  const { questoes, progress, loading, meta } = useApp()
  const { limits, user } = useAuth()
  const isPro = limits?.cronograma ?? user?.plan === 'pro'
  const examDate = progress.profile?.examDate
  const dias = diasParaProva(new Date(), examDate)
  const total = meta?.total_questoes ?? questoes.length
  const { metaDiaria } = calcMetaDiaria(total, progress.respostas.length, dias)
  const hoje = questoesRespondidasHoje(progress.respostas)
  const xp = calcXp(progress)
  const level = levelFromXp(xp)
  const trilha = gerarTrilha({ totalQuestoes: total, respostas: progress.respostas, examDate })
  const ultimoSim = progress.simulados[0]
  const passaria = ultimoSim ? passariaHoje(ultimoSim.acertos, ultimoSim.total) : null

  const totalRespondidas = progress.respostas.length
  const acertos = progress.respostas.filter((r) => r.correta).length
  const pctAcerto = totalRespondidas > 0 ? Math.round((acertos / totalRespondidas) * 100) : 0
  const salvos = progress.salvosRevisao.length

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="glow-pulse rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 text-white">
        <p className="text-sm font-medium text-brand-100">Reta final OAB</p>
        <p className="mt-1 text-3xl font-extrabold">
          {dias === 0 ? 'É HOJE! 🎯' : `Faltam ${dias} dias`}
        </p>
        <p className="mt-1 text-sm text-white/80">próxima prova objetiva — 06/09/2026</p>
      </section>

      <section className="card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-600">Nível {level.level} · {level.title}</p>
            <p className="text-sm text-muted">{xp} XP · streak {progress.flashcardStreak} 🔥</p>
          </div>
          {passaria !== null && (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${passaria ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>
              {passaria ? 'Passaria hoje' : 'Abaixo da meta'}
            </span>
          )}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-700">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${level.progressPct}%` }} />
        </div>
      </section>

      <section className="card rounded-2xl p-4">
        <h2 className="font-semibold text-ink">Trilha de hoje</h2>
        <p className="mt-1 text-xs text-muted">{trilha.feitasHoje}/{trilha.metaQuestoes} questões · meta diária</p>
        <ul className="mt-3 space-y-2">
          {trilha.tarefas.map((t) => (
            <li key={t.tipo}>
              <Link to={t.link} className="flex items-center justify-between rounded-xl bg-surface-700 px-3 py-2 text-sm hover:bg-brand-50">
                <span className="text-ink">{t.label}</span>
                <span className="font-semibold text-brand-600">{t.qtd}{t.tipo === 'sim' ? 'q' : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Respondidas" value={String(totalRespondidas)} />
        <StatCard label="Acerto geral" value={`${pctAcerto}%`} highlight={pctAcerto >= 50} />
        <StatCard label="Salvos revisão" value={String(salvos)} />
      </section>

      <section className="card rounded-2xl p-4">
        <h2 className="mb-3 font-semibold text-ink">Banco de questões</h2>
        <p className="text-sm text-muted">
          {meta?.total_questoes ?? questoes.length} questões · {meta?.examenes?.length ?? 0} exames
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(meta?.examenes ?? []).slice(0, 5).map((e) => (
            <span key={e} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600">
              {e}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-ink">Módulos de estudo</h2>
        <ModuleLink
          to="/app/flashcards"
          emoji="⚡"
          title="Flashcards Rápidos"
          desc="Active recall estilo swipe — errei ou acertei!"
        />
        <ModuleLink
          to="/app/simulado"
          emoji="📝"
          title="Simulado Realista"
          desc="80 questões · 5 horas · cronômetro por questão"
        />
        <ModuleLink
          to="/app/revisao"
          emoji="🔄"
          title="Revisão de erros"
          desc="Fila automática das questões que você errou + IA"
        />
        <ModuleLink
          to="/app/desempenho"
          emoji="📊"
          title="Desempenho por matéria"
          desc="Gráficos de acerto por matéria + anotações"
        />
        <ModuleLink
          to="/app/cronograma"
          emoji="📅"
          title="Meta diária"
          desc={isPro ? `${metaDiaria} questões/dia · ${hoje} feitas hoje` : 'Cronograma até a prova — Plano Pro'}
          pro={!isPro}
        />
        <ModuleLink
          to="/app/pecas"
          emoji="⚖️"
          title="2ª fase — Adivinhe a peça"
          desc="Leia o caso e identifique a peça processual correta"
        />
      </section>

      {progress.flashcardStreak >= 3 && (
        <p className="text-center text-sm font-medium text-brand-500">
          🔥 Sequência de {progress.flashcardStreak} acertos nos flashcards!
        </p>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${highlight ? 'text-green-600' : 'text-ink'}`}>{value}</p>
      <p className="mt-1 text-[10px] leading-tight text-muted">{label}</p>
    </div>
  )
}

function ModuleLink({ to, emoji, title, desc, pro }: { to: string; emoji: string; title: string; desc: string; pro?: boolean }) {
  return (
    <Link
      to={to}
      className="card flex items-center gap-4 rounded-2xl p-4 transition hover:shadow-md active:scale-[0.98]"
    >
      <span className="text-3xl">{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-ink">{title}</p>
          {pro && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">PRO</span>}
        </div>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <span className="shrink-0 text-brand-400">→</span>
    </Link>
  )
}
