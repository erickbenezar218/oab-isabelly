import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconCalendar,
  IconChart,
  IconCheck,
  IconClipboard,
  IconFlame,
  IconRefresh,
  IconScale,
  IconTarget,
  IconZap,
  type IconProps,
} from '../components/icons'
import ActivityPanel from '../components/ui/ActivityPanel'
import PageHeader from '../components/ui/PageHeader'
import PerformanceChart from '../components/ui/PerformanceChart'
import SectionCard from '../components/ui/SectionCard'
import StatCard from '../components/ui/StatCard'
import TaskRow, { type TaskStatus } from '../components/ui/TaskRow'
import UpgradeCard from '../components/ui/UpgradeCard'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import ExamDateEditor from '../components/ExamDateEditor'
import { formatExamDatePt, provaCountdown } from '../lib/examDate'
import { calcMetaDiaria, diasParaProva, questoesRespondidasHoje } from '../lib/cronograma'
import { levelFromXp, calcXp, passariaHoje } from '../lib/gamification'
import { gerarTrilha } from '../lib/trilha'
import { computeBadges } from '../lib/achievements'
import { continueWhereLeftOff, dashboardAlerts, recentActivityItems } from '../lib/dashboardInsights'
import type { ComponentType } from 'react'

const modulos: {
  to: string
  Icon: ComponentType<IconProps>
  title: string
  desc: string
  pro?: boolean
}[] = [
  { to: '/app/flashcards', Icon: IconZap, title: 'Flashcards rápidos', desc: 'Toque na alternativa — correção automática' },
  { to: '/app/simulado', Icon: IconClipboard, title: 'Simulado realista', desc: '80 questões · 5 horas' },
  { to: '/app/revisao', Icon: IconRefresh, title: 'Revisão de erros', desc: 'Fila automática + tutor IA' },
  { to: '/app/desempenho', Icon: IconChart, title: 'Desempenho por matéria', desc: 'Gráficos e anotações' },
  { to: '/app/cronograma', Icon: IconCalendar, title: 'Meta diária', desc: 'Cronograma até a prova', pro: true },
  { to: '/app/pecas', Icon: IconScale, title: '2ª fase — peças', desc: 'Adivinhe a peça processual' },
]

const alertStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-green-200 bg-green-50 text-green-900',
}

export default function Dashboard() {
  const { questoes, progress, loading, meta } = useApp()
  const { limits, user } = useAuth()
  const isPro = limits?.cronograma ?? user?.plan === 'pro'
  const examDate = progress.profile?.examDate
  const goalOverride = progress.profile?.dailyGoalOverride
  const countdown = provaCountdown(examDate)
  const rawDias = diasParaProva(new Date(), examDate)
  const diasMeta = rawDias != null && rawDias > 0 ? rawDias : 30
  const total = meta?.total_questoes ?? questoes.length
  const { metaDiaria } = calcMetaDiaria(total, progress.respostas.length, diasMeta, goalOverride)
  const hoje = questoesRespondidasHoje(progress.respostas)
  const xp = calcXp(progress)
  const level = levelFromXp(xp)
  const trilha = gerarTrilha({ totalQuestoes: total, respostas: progress.respostas, examDate, dailyGoalOverride: goalOverride })
  const ultimoSim = progress.simulados[0]
  const passaria = ultimoSim ? passariaHoje(ultimoSim.acertos, ultimoSim.total) : null

  const totalRespondidas = progress.respostas.length
  const acertos = progress.respostas.filter((r) => r.correta).length
  const pctAcerto = totalRespondidas > 0 ? Math.round((acertos / totalRespondidas) * 100) : 0
  const pctHoje = metaDiaria > 0 ? Math.min(100, Math.round((hoje / metaDiaria) * 100)) : 0
  const firstName = user?.name?.split(' ')[0] ?? 'estudante'

  const continueHint = continueWhereLeftOff(progress)
  const alerts = dashboardAlerts({
    progress,
    metaDiaria,
    diasProva: rawDias,
    planExpiresAt: user?.planExpiresAt ?? null,
    isPro: Boolean(isPro),
  })
  const badges = computeBadges(progress).filter((b) => b.earned)
  const activityItems = recentActivityItems(progress)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="xl:grid xl:grid-cols-[1fr_300px] xl:items-start xl:gap-6">
      <div className="space-y-6">
        <PageHeader
          title={`Olá, ${firstName}`}
          subtitle={
            countdown.status === 'unset'
              ? 'Informe quando será a sua prova para personalizar o app.'
              : countdown.status === 'past'
                ? 'Atualize a data da prova para ver a contagem correta.'
                : countdown.status === 'today'
                  ? 'Prova hoje — foco total e boa sorte!'
                  : `${countdown.label}. Meta de hoje: ${pctHoje >= 100 ? 'concluída' : `${hoje}/${metaDiaria} questões`}.`
          }
        />

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${alertStyles[a.tone]}`}
              >
                <span>{a.message}</span>
                {a.action && (
                  <Link to={a.action.to} className="shrink-0 text-xs font-semibold underline underline-offset-2">
                    {a.action.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {continueHint && (
          <Link
            to={continueHint.to}
            className="group flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <IconArrowRight size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Continuar de onde parou</p>
              <p className="font-semibold text-ink">{continueHint.label}</p>
              <p className="text-xs text-muted">{continueHint.desc}</p>
            </div>
            <IconArrowRight size={18} className="shrink-0 text-brand-500 transition group-hover:translate-x-0.5" />
          </Link>
        )}

        <div className="card-featured rounded-3xl p-6 text-white md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">Sua prova objetiva</p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold md:text-4xl">
                {countdown.status === 'unset' ? (
                  'Sem data'
                ) : countdown.status === 'past' ? (
                  'Data passada'
                ) : countdown.status === 'today' ? (
                  <>
                    Prova hoje!
                    <IconTarget size={28} className="text-brand-200" />
                  </>
                ) : (
                  `${countdown.dias} dias`
                )}
              </p>
              <p className="mt-1 text-sm text-white/75">
                {formatExamDatePt(examDate)} · Nível {level.level} · {xp} XP
              </p>
              {(countdown.status === 'past' || countdown.status === 'unset') && (
                <div className="mt-3 text-ink">
                  <ExamDateEditor compact />
                </div>
              )}
            </div>
            {passaria !== null && (
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${passaria ? 'bg-green-500/20 text-green-100' : 'bg-amber-500/20 text-amber-100'}`}
              >
                {passaria ? 'Passaria hoje' : 'Abaixo da meta'}
              </span>
            )}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-brand-300" style={{ width: `${level.progressPct}%` }} />
          </div>
        </div>

        {pctHoje < 100 && metaDiaria > 0 && (
          <Link
            to="/app/flashcards"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-brand-200"
          >
            <div className="flex items-center gap-3">
              <IconTarget size={22} className="text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink">Meta do dia</p>
                <p className="text-xs text-muted">
                  Faltam {Math.max(0, metaDiaria - hoje)} questões para bater a meta
                </p>
              </div>
            </div>
            <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">Estudar</span>
          </Link>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Respondidas"
            value={String(totalRespondidas)}
            delta={`+${hoje} hoje`}
            deltaTone="up"
            icon={<IconCheck size={20} />}
          />
          <StatCard
            label="Acerto geral"
            value={`${pctAcerto}%`}
            delta={pctAcerto >= 50 ? 'Acima da meta' : 'Reforce matérias'}
            deltaTone={pctAcerto >= 50 ? 'up' : 'down'}
            icon={<IconChart size={20} />}
          />
          <StatCard
            label="Meta diária"
            value={`${hoje}/${metaDiaria}`}
            delta={`${pctHoje}% concluído`}
            deltaTone={pctHoje >= 100 ? 'up' : 'neutral'}
            icon={<IconTarget size={20} />}
          />
        </div>

        {badges.length > 0 && (
          <SectionCard title="Conquistas" subtitle={`${badges.length} badge${badges.length === 1 ? '' : 's'} desbloqueada${badges.length === 1 ? '' : 's'}`}>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b.id}
                  title={b.desc}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                >
                  {b.label}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        <PerformanceChart respostas={progress.respostas} />

        <SectionCard
          title="Trilha de hoje"
          subtitle={`${trilha.feitasHoje}/${trilha.metaQuestoes} questões · meta diária`}
          action={
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
              {pctHoje}% feito
            </span>
          }
        >
          <div className="space-y-2">
            {trilha.tarefas.map((t) => {
              const done = t.tipo === 'sim' ? trilha.feitasHoje >= t.qtd : false
              const status: TaskStatus = done ? 'done' : 'progress'
              return (
                <TaskRow
                  key={t.tipo}
                  to={t.link}
                  icon={<IconZap size={18} />}
                  title={t.label}
                  status={status}
                  statusLabel={done ? 'Concluído' : 'Em progresso'}
                  meta={`${t.qtd}${t.tipo === 'sim' ? 'q' : ''}`}
                />
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Módulos de estudo" subtitle="Escolha como estudar agora">
          <div className="space-y-2">
            {modulos.map(({ to, Icon, title, desc, pro }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-4 rounded-2xl border border-transparent bg-surface-700/60 px-4 py-3.5 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{title}</p>
                    {pro && !isPro && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">PRO</span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                <IconArrowRight size={18} className="shrink-0 text-muted-light transition group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
        </SectionCard>

        {progress.flashcardStreak >= 3 && (
          <p className="flex items-center justify-center gap-2 text-center text-sm font-medium text-brand-600">
            <IconFlame size={18} className="text-orange-500" />
            Sequência de {progress.flashcardStreak} acertos nos flashcards!
          </p>
        )}

        {!isPro && (
          <div className="xl:hidden">
            <UpgradeCard />
          </div>
        )}

        <div className="xl:hidden">
          <ActivityPanel
            name={user?.name ?? 'Estudante'}
            email={user?.email}
            simulados={progress.simulados}
            pctAcerto={pctAcerto}
            streak={progress.flashcardStreak}
            activityItems={activityItems}
          />
        </div>
      </div>

      <div className="hidden xl:block">
        <ActivityPanel
          name={user?.name ?? 'Estudante'}
          email={user?.email}
          simulados={progress.simulados}
          pctAcerto={pctAcerto}
          streak={progress.flashcardStreak}
          activityItems={activityItems}
        />
      </div>
    </div>
  )
}
