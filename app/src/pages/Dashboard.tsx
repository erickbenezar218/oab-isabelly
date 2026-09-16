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
import { calcMetaDiaria, diasParaProva, questoesRespondidasHoje } from '../lib/cronograma'
import { levelFromXp, calcXp, passariaHoje } from '../lib/gamification'
import { gerarTrilha } from '../lib/trilha'
import type { ComponentType } from 'react'

const modulos: {
  to: string
  Icon: ComponentType<IconProps>
  title: string
  desc: string
  pro?: boolean
}[] = [
  { to: '/app/flashcards', Icon: IconZap, title: 'Flashcards rápidos', desc: 'Active recall estilo swipe' },
  { to: '/app/simulado', Icon: IconClipboard, title: 'Simulado realista', desc: '80 questões · 5 horas' },
  { to: '/app/revisao', Icon: IconRefresh, title: 'Revisão de erros', desc: 'Fila automática + tutor IA' },
  { to: '/app/desempenho', Icon: IconChart, title: 'Desempenho por matéria', desc: 'Gráficos e anotações' },
  { to: '/app/cronograma', Icon: IconCalendar, title: 'Meta diária', desc: 'Cronograma até a prova', pro: true },
  { to: '/app/pecas', Icon: IconScale, title: '2ª fase — peças', desc: 'Adivinhe a peça processual' },
]

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
  const pctHoje = metaDiaria > 0 ? Math.min(100, Math.round((hoje / metaDiaria) * 100)) : 0
  const firstName = user?.name?.split(' ')[0] ?? 'estudante'

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
            dias === 0
              ? 'Prova hoje — mantenha o foco e confie no seu ritmo.'
              : `Faltam ${dias} dias para a prova. Você está ${pctHoje >= 100 ? 'no caminho certo' : 'quase na meta de hoje'}.`
          }
        />

        {/* Countdown banner */}
        <div className="card-featured rounded-3xl p-6 text-white md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">Reta final OAB</p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold md:text-4xl">
                {dias === 0 ? (
                  <>
                    É HOJE!
                    <IconTarget size={28} className="text-brand-200" />
                  </>
                ) : (
                  `${dias} dias`
                )}
              </p>
              <p className="mt-1 text-sm text-white/75">Nível {level.level} · {level.title} · {xp} XP</p>
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

        {/* Stats row */}
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

        <PerformanceChart respostas={progress.respostas} />

        {/* Trilha de hoje */}
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

        {/* Módulos */}
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
      </div>

      {/* Right panel — desktop */}
      <div className="hidden xl:block">
        <ActivityPanel
          name={user?.name ?? 'Estudante'}
          email={user?.email}
          simulados={progress.simulados}
          pctAcerto={pctAcerto}
        />
      </div>
    </div>
  )
}
