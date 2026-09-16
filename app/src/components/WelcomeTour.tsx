import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
  route: string
  Icon: ComponentType<IconProps>
  title: string
  description: string
  tip?: string
  pro?: boolean
}

const STEPS: Step[] = [
  {
    route: '/app',
    Icon: IconHome,
    title: 'Olá! Este é seu painel',
    description:
      'Aqui você vê um resumo do seu estudo: quantas questões fez, quanto acertou e o que fazer hoje.',
    tip: 'Use o menu lateral (ou embaixo no celular) para trocar de tela.',
  },
  {
    route: '/app/flashcards',
    Icon: IconZap,
    title: 'Flashcards — questões rápidas',
    description:
      'Escolha a matéria, leia a questão e toque na alternativa — o app corrige sozinho e explica. Ideal para revisar em poucos minutos.',
    tip: 'Você pode salvar questões difíceis para ver de novo depois.',
  },
  {
    route: '/app/simulado',
    Icon: IconClipboard,
    title: 'Simulado — igual à prova',
    description:
      'Faça 80 questões com cronômetro, como no dia da OAB. No plano grátis: 1 simulado por mês. No Pro: ilimitado.',
    tip: 'Depois do simulado, revise só o que errou.',
  },
  {
    route: '/app/revisao',
    Icon: IconRefresh,
    title: 'Revisão dos erros',
    description:
      'O app guarda automaticamente as questões que você errou e monta uma fila para você estudar de novo.',
    tip: 'A inteligência artificial explica por que você errou.',
  },
  {
    route: '/app/desempenho',
    Icon: IconChart,
    title: 'Como você está indo',
    description:
      'Gráficos mostram em quais matérias você vai bem e em quais precisa estudar mais. Também dá para salvar anotações.',
    tip: 'Olhe aqui antes de decidir o que revisar.',
  },
  {
    route: '/app/cronograma',
    Icon: IconCalendar,
    title: 'Meta do dia',
    description:
      'Com base na data da prova, calculamos quantas questões fazer por dia para passar por todo o material.',
    tip: 'Recurso do plano Pro — vale a pena se você tem pouco tempo.',
    pro: true,
  },
  {
    route: '/app/pecas',
    Icon: IconScale,
    title: '2ª fase — adivinhe a peça',
    description:
      'Leia o caso da prova prática e escolha qual peça o advogado deve escrever (contestação, recurso, etc.).',
    tip: 'Treino essencial para quem vai fazer a segunda fase.',
  },
  {
    route: '/app',
    Icon: IconSparkles,
    title: 'Professor com inteligência artificial',
    description:
      'Quando errar uma questão, toque para ver a explicação em linguagem simples — o que a banca queria e o que revisar.',
    tip: 'Disponível nos flashcards, simulado e revisão.',
  },
  {
    route: '/app',
    Icon: IconTarget,
    title: 'Tudo pronto!',
    description:
      'Comece pelos flashcards ou faça um simulado para ver seu nível. Qualquer dúvida: suporte@simulaordem.com.br',
    tip: 'Bons estudos — você consegue!',
  },
]

export default function WelcomeTour() {
  const { progress, updateProfile } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const onboardingDone = progress.profile?.onboardingDone
  const tourDone = progress.profile?.welcomeTourDone

  const active = onboardingDone && !tourDone
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    if (!active) return
    navigate(current.route)
  }, [active, step, current.route, navigate])

  if (!active) return null

  const Icon = current.Icon

  const finish = () => {
    void updateProfile({ welcomeTourDone: true })
  }

  const goNext = () => {
    if (isLast) finish()
    else setStep((s) => s + 1)
  }

  const goPrev = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  return (
    <>
      {/* Overlay leve — a tela de fundo continua visível */}
      <div className="pointer-events-none fixed inset-0 z-[110] bg-black/25" aria-hidden />

      <div
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-[111] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:p-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-tour-title"
      >
        <div className="card rounded-3xl border-brand-200 p-5 shadow-2xl ring-2 ring-brand-500/20 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-brand-600">
              Passo {step + 1} de {STEPS.length}
            </p>
            <button type="button" onClick={finish} className="text-xs font-medium text-muted hover:text-ink">
              Pular explicação
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="welcome-tour-title" className="text-lg font-bold text-ink">
                {current.title}
              </h2>
              {current.pro && (
                <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  PLANO PRO
                </span>
              )}
              <p className="mt-2 text-sm leading-relaxed text-muted">{current.description}</p>
              {current.tip && (
                <p className="mt-2 rounded-xl bg-surface-700 px-3 py-2 text-xs leading-relaxed text-muted">
                  {current.tip}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-brand-600' : 'w-1.5 bg-surface-600'}`}
              />
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {step > 0 && (
              <button type="button" onClick={goPrev} className="btn-secondary flex-1 py-3 text-sm font-semibold">
                Voltar
              </button>
            )}
            <button type="button" onClick={goNext} className="btn-primary flex-1 py-3 text-sm font-semibold">
              {isLast ? 'Começar a estudar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
