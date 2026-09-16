import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconCalendar,
  IconChart,
  IconClipboard,
  IconHome,
  IconRefresh,
  IconScale,
  IconSparkles,
  IconTarget,
  IconZap,
  type IconProps,
} from './icons'
import { useApp } from '../context/AppContext'
import type { ComponentType } from 'react'

type Step = {
  Icon: ComponentType<IconProps>
  title: string
  description: string
  bullets: string[]
  link?: { to: string; label: string }
  pro?: boolean
}

const STEPS: Step[] = [
  {
    Icon: IconHome,
    title: 'Bem-vindo ao SimulaOrdem',
    description: 'Seu painel reúne tudo para a reta final da OAB — objetiva e 2ª fase — em um só lugar.',
    bullets: [
      'Acompanhe dias até a prova e meta diária',
      'Veja acertos, streak e trilha de hoje',
      'Escolha o módulo certo para cada momento',
    ],
  },
  {
    Icon: IconZap,
    title: 'Flashcards',
    description: 'Active recall estilo swipe: revele o gabarito e marque se acertou ou errou.',
    bullets: [
      'Filtre por matéria, exame ou revisão',
      'Salve questões difíceis para depois',
      'Professor IA explica quando você erra',
    ],
    link: { to: '/app/flashcards', label: 'Ir aos flashcards' },
  },
  {
    Icon: IconClipboard,
    title: 'Simulado realista',
    description: '80 questões e 5 horas — cronômetro global e por questão, igual à prova.',
    bullets: [
      'Modo express com 40 questões',
      'Marque questões para revisar depois',
      'Histórico com revisão erro a erro',
    ],
    link: { to: '/app/simulado', label: 'Iniciar simulado' },
  },
  {
    Icon: IconRefresh,
    title: 'Revisão de erros',
    description: 'Fila automática das questões que você errou nos flashcards e simulados.',
    bullets: [
      'Estude na ordem certa, sem perder tempo',
      'Tutor IA comenta cada erro',
      'Reforce antes do próximo simulado',
    ],
    link: { to: '/app/revisao', label: 'Abrir revisão' },
  },
  {
    Icon: IconChart,
    title: 'Desempenho',
    description: 'Gráficos de acerto por matéria mostram onde você precisa estudar mais.',
    bullets: [
      'Percentual por matéria atualizado',
      'Histórico dos últimos simulados',
      'Anotações salvas na sua conta',
    ],
    link: { to: '/app/desempenho', label: 'Ver desempenho' },
  },
  {
    Icon: IconCalendar,
    title: 'Meta diária',
    description: 'Cronograma inteligente até a prova — quantas questões fazer por dia.',
    bullets: [
      'Trilha sugerida para hoje',
      'Cenários se faltam 60, 30 ou 10 dias',
      'Disponível no plano Pro',
    ],
    link: { to: '/app/cronograma', label: 'Ver meta diária' },
    pro: true,
  },
  {
    Icon: IconScale,
    title: '2ª fase — Peças',
    description: 'Leia o caso prático e identifique qual peça processual deve ser elaborada.',
    bullets: [
      'Casos por área do exame',
      'Explicação do momento processual',
      'Treino do “pulo do gato” da peça certa',
    ],
    link: { to: '/app/pecas', label: 'Treinar peças' },
  },
  {
    Icon: IconSparkles,
    title: 'Professor IA',
    description: 'Errou? A IA explica o raciocínio jurídico e o que revisar — sem juridiquês desnecessário.',
    bullets: [
      'Gabarito comentado por questão',
      'Chat para tirar dúvidas (Pro)',
      'Integrado em flashcards, revisão e simulado',
    ],
  },
  {
    Icon: IconTarget,
    title: 'Pronto para começar!',
    description: 'Comece pela trilha de hoje no Início ou faça um simulado para medir seu ritmo.',
    bullets: [
      '1 simulado grátis por mês no plano Free',
      'Flashcards e peças liberados',
      'Upgrade Pro quando quiser simulados ilimitados',
    ],
    link: { to: '/app', label: 'Ir para o início' },
  },
]

export default function WelcomeTour() {
  const { progress, updateProfile } = useApp()
  const [step, setStep] = useState(0)

  const onboardingDone = progress.profile?.onboardingDone
  const tourDone = progress.profile?.welcomeTourDone

  if (!onboardingDone || tourDone) return null

  const current = STEPS[step]
  const Icon = current.Icon
  const isLast = step === STEPS.length - 1

  const finish = () => {
    updateProfile({ welcomeTourDone: true })
  }

  const next = () => {
    if (isLast) finish()
    else setStep((s) => s + 1)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="card w-full max-w-lg rounded-3xl p-6 shadow-2xl md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-tour-title"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
            Tour · {step + 1}/{STEPS.length}
          </p>
          <button
            type="button"
            onClick={finish}
            className="text-xs font-medium text-muted transition hover:text-ink"
          >
            Pular tour
          </button>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon size={28} />
        </div>

        <h2 id="welcome-tour-title" className="mt-4 text-xl font-bold text-ink md:text-2xl">
          {current.title}
        </h2>
        {current.pro && (
          <span className="mt-2 inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
            PLANO PRO
          </span>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted">{current.description}</p>

        <ul className="mt-4 space-y-2">
          {current.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              {b}
            </li>
          ))}
        </ul>

        {current.link && (
          <Link
            to={current.link.to}
            onClick={finish}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            {current.link.label}
            <IconArrowRight size={14} />
          </Link>
        )}

        <div className="mt-6 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Passo ${i + 1}`}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-brand-600' : 'w-2 bg-surface-600'}`}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary flex-1 py-3 text-sm font-semibold"
            >
              Anterior
            </button>
          )}
          <button type="button" onClick={next} className="btn-primary flex-1 py-3 text-sm font-semibold">
            {isLast ? 'Começar a estudar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
