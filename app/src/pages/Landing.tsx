import { useEffect, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AnimatedBars, useInView } from '../components/landing/motion'
import { SiteFooter, SiteHeader } from '../components/landing/SiteChrome'
import { OabTermometroDemo } from '../components/OabTermometro'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import { LAUNCH_OFFER_LABEL, PROMO_PRICING } from '../lib/pricing'
import { trackLead } from '../lib/metaPixel'

const features = [
  {
    icon: ClockIcon,
    title: 'Simulado no formato real',
    desc: '80 questões em 5 horas, com cronômetro e cartão-resposta como no dia da prova.',
  },
  {
    icon: ScaleIcon,
    title: 'Treino de peças da 2ª fase',
    desc: 'Leia o caso e identifique a peça processual correta antes de redigir.',
  },
  {
    icon: ChartIcon,
    title: 'Desempenho por matéria',
    desc: 'Percentual de acerto em cada disciplina, para estudar onde mais pesa.',
  },
  {
    icon: RefreshIcon,
    title: 'Revisão dos seus erros',
    desc: 'Volte a cada questão errada com gabarito comentado e explicação da IA.',
  },
]

const trustItems = [
  '1.120+ questões oficiais da OAB',
  'Treino de peças da 2ª fase',
  'Progresso salvo na nuvem, na web e no iPhone',
  'Grátis para começar, sem cartão',
]

const h2 = 'text-balance font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.01em] text-ink md:text-[2.75rem]'
const lead = 'mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg'

export default function Landing() {
  const { user } = useAuth()
  const ctaTo = user ? '/app' : '/login'
  const ctaLabel = user ? 'Abrir o app' : 'Começar grátis'
  const onLead = (source: string) => (user ? undefined : () => trackLead(source))

  return (
    <div className="landing-page min-h-dvh overflow-x-hidden bg-white text-ink">
      <SiteHeader ctaTo={ctaTo} ctaLabel={ctaLabel} current="landing" onCtaClick={onLead('landing-header')} />

      <main>
        <Hero ctaTo={ctaTo} ctaLabel={ctaLabel} onCtaClick={onLead('landing-hero')} />
        <WhySection />
        <TermometroSection ctaTo={ctaTo} onCtaClick={onLead('landing-termometro')} />
        <DesempenhoSection />
        <AiLearningSection />
        <DarkFeature />
        <TrustSection />
        <TestimonialsSection />
        <CtaSection ctaTo={ctaTo} ctaLabel={ctaLabel} onCtaClick={onLead('landing-cta-final')} />
      </main>

      <SiteFooter />
    </div>
  )
}

function Hero({ ctaTo, ctaLabel, onCtaClick }: { ctaTo: string; ctaLabel: string; onCtaClick?: () => void }) {
  return (
    <section className="relative px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-brand-500">Exame de Ordem, 1ª e 2ª fase</p>
          <h1 className="mt-4 text-balance font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.02em] text-ink sm:text-6xl lg:text-[4.25rem]">
            São 40 acertos para passar. Descubra hoje quantos você faz.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Simulados de 80 questões no tempo da prova, correção explicada pela IA e treino de peças da 2ª fase. No
            computador ou no celular.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={ctaTo}
              onClick={onCtaClick}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-brand-700"
            >
              {ctaLabel}
            </Link>
            <a
              href="#recursos"
              className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-6 font-semibold text-ink transition-colors duration-150 hover:border-brand-400 hover:bg-surface-900"
            >
              Ver os recursos
            </a>
          </div>
          <p className="mt-6 text-sm text-muted">1.120+ questões oficiais. Grátis para começar, sem cartão.</p>
        </div>

        <CartaoResposta />
      </div>
    </section>
  )
}

const TOTAL_QUESTOES = 80
const LINHA_DE_CORTE = 40
const ACERTOS_DEMO = 47
// Distribuição fixa e "irregular" de erros, para o cartão parecer um simulado real.
const respostasDemo = Array.from({ length: TOTAL_QUESTOES }, (_, i) => (i * 37 + 11) % TOTAL_QUESTOES >= TOTAL_QUESTOES - ACERTOS_DEMO)

function useCountUp(target: number, durationMs: number, delayMs: number) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [value, setValue] = useState(reduced ? target : 0)

  useEffect(() => {
    if (reduced) return
    let frame = 0
    const start = performance.now() + delayMs
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / durationMs, 0), 1)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, delayMs, reduced])

  return value
}

/** Cartão-resposta do simulado: a peça central da landing. */
function CartaoResposta() {
  const acertos = useCountUp(ACERTOS_DEMO, 1900, 350)
  const passou = acertos >= LINHA_DE_CORTE

  return (
    <figure
      className="relative mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(15,42,39,0.35)] sm:p-7"
      aria-label={`Exemplo de cartão-resposta: ${ACERTOS_DEMO} acertos de ${TOTAL_QUESTOES}, acima da linha de corte de ${LINHA_DE_CORTE}.`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <figcaption className="text-sm font-semibold text-ink">Cartão-resposta do simulado</figcaption>
        <span className="text-xs tabular-nums text-muted">4h12 de 5h</span>
      </div>

      <div className="mt-5 grid grid-cols-10 gap-x-2 gap-y-2.5" aria-hidden>
        {respostasDemo.map((acertou, i) => (
          <span
            key={i}
            className={`gabarito-bubble aspect-square rounded-full ${
              acertou ? 'bg-brand-600' : 'border-[1.5px] border-rose-300 bg-rose-50'
            }`}
            style={{ '--bubble-delay': `${120 + i * 22}ms` } as CSSProperties}
          />
        ))}
      </div>

      <div className="mt-7">
        <div className="flex items-end justify-between">
          <p className="font-display text-5xl font-medium leading-none tabular-nums text-ink">
            {acertos}
            <span className="ml-1 font-sans text-base font-medium text-muted">/ {TOTAL_QUESTOES} acertos</span>
          </p>
        </div>

        <div className="relative mt-5 h-2.5 rounded-full bg-surface-700" aria-hidden>
          <div
            className="gabarito-meter absolute inset-y-0 left-0 rounded-full bg-brand-500"
            style={{ width: `${(ACERTOS_DEMO / TOTAL_QUESTOES) * 100}%` }}
          />
          <div className="absolute -inset-y-1.5 left-1/2 w-0.5 rounded-full bg-ink" />
        </div>
        <div className="relative mt-2 h-4 text-xs text-muted" aria-hidden>
          <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-medium text-ink">
            Linha de corte: {LINHA_DE_CORTE}
          </span>
        </div>
      </div>

      <p
        className={`gabarito-verdict mt-5 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
          passou ? 'bg-green-50 text-green-800' : 'bg-surface-700 text-muted'
        }`}
      >
        <CheckIcon className="h-4 w-4 text-green-700" />
        Aprovado com {ACERTOS_DEMO - LINHA_DE_CORTE} questões de folga
      </p>
    </figure>
  )
}

function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h2 className={h2}>{title}</h2>
      {children && <p className={lead}>{children}</p>}
    </div>
  )
}

function WhySection() {
  return (
    <section id="recursos" className="scroll-mt-20 bg-surface-900 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Tudo o que a prova cobra, num só lugar">
          Treino no formato da FGV, com dados que mostram onde você precisa melhorar.
        </SectionHeading>

        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="border-t-2 border-brand-600 pt-5">
              <Icon />
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TermometroSection({ ctaTo, onCtaClick }: { ctaTo: string; onCtaClick?: () => void }) {
  return (
    <section id="termometro" className="bg-white px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <OabTermometroDemo />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading title="Você passaria hoje?">
            O termômetro usa seu último simulado para projetar quantos acertos você faria em 80 questões. A meta da OAB
            é <strong className="font-semibold text-ink">40 acertos</strong>.
          </SectionHeading>
          <CheckList
            className="mt-6"
            items={[
              'Atualiza sozinho depois de cada simulado',
              'Disponível no plano grátis, na web e no iPhone',
              'Mostra se você está longe, perto ou já no ritmo da aprovação',
            ]}
          />
          <Link
            to={ctaTo}
            onClick={onCtaClick}
            className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
          >
            Ver meu termômetro
          </Link>
        </div>
      </div>
    </section>
  )
}

const materiasMock = [
  { nome: 'Ética', pct: 81 },
  { nome: 'Constitucional', pct: 72 },
  { nome: 'Penal', pct: 63 },
  { nome: 'Administrativo', pct: 58 },
  { nome: 'Civil', pct: 45 },
]

function DesempenhoSection() {
  return (
    <section id="desempenho" className="scroll-mt-20 bg-surface-900 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading title="Saiba exatamente onde estudar mais">
            Seu percentual de acerto em Constitucional, Civil, Penal, Ética e todas as outras matérias. Sem termos
            complicados: você vê onde vai bem e o que reforçar antes da prova.
          </SectionHeading>
          <CheckList
            className="mt-8"
            items={[
              'Percentual por matéria, atualizado a cada questão',
              'As matérias mais fracas aparecem primeiro',
              'Sua evolução ao longo dos simulados',
            ]}
          />
        </div>
        <DesempenhoMockup />
      </div>
    </section>
  )
}

function DesempenhoMockup() {
  const { ref, inView } = useInView(0.3)

  return (
    <div ref={ref as RefObject<HTMLDivElement>} className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Desempenho por matéria</p>
            <p className="text-xs text-muted">Últimos simulados e flashcards</p>
          </div>
          <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">62% geral</span>
        </div>

        <div className="mt-6">
          <AnimatedBars items={materiasMock} inView={inView} />
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs font-medium text-brand-700">
          <TargetIcon />
          <span>Prioridade da semana: Direito Civil, 45% de acerto</span>
        </div>
      </div>
    </div>
  )
}

const aiBenefits = [
  'Explica por que você errou, em linguagem clara',
  'Aponta o fundamento jurídico da alternativa correta',
  'Sugere o que revisar antes do próximo simulado',
]

function AiLearningSection() {
  return (
    <section id="ia" className="scroll-mt-20 bg-white px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <AiTutorMockup />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading title="Cada erro vira uma aula">
            Errou no simulado ou no flashcard? O tutor IA compara sua resposta com o gabarito e explica o raciocínio,
            para você não repetir o erro na prova.
          </SectionHeading>
          <CheckList className="mt-8" items={aiBenefits} />
        </div>
      </div>
    </section>
  )
}

function AiTutorMockup() {
  const { ref, inView } = useInView(0.25)

  return (
    <div ref={ref as RefObject<HTMLDivElement>} className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <SparklesIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Tutor IA</p>
            <p className="text-xs text-muted">Questão 42, Direito Constitucional</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-rose-700">Sua resposta: B</span>
            <span className="rounded-lg bg-green-50 px-2.5 py-1.5 text-green-800">Gabarito: C</span>
          </div>

          <div
            className={`rounded-2xl bg-surface-900 p-4 ${inView ? 'landing-ai-typing-visible landing-ai-typing' : 'opacity-0'}`}
          >
            <p className="font-display text-[1.05rem] leading-relaxed text-ink">
              Você confundiu direito de liberdade com direito de igualdade. A alternativa C está correta porque trata da
              reserva legal dos direitos fundamentais, conforme o art. 5º, §2º da CF/88.
            </p>
            <p className="mt-3 text-xs font-medium text-brand-600">
              Para revisar: princípios constitucionais e reserva legal
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-hidden>
            <span className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white">Entendi</span>
            <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-muted">
              Salvar para revisar
            </span>
            <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-muted">
              Próximo erro
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DarkFeature() {
  const prompts = [
    'Quais matérias estou errando mais?',
    'Meu ritmo está bom para 5 horas?',
    'Quantos acertos preciso para passar?',
    'O que revisar antes da prova?',
  ]

  return (
    <section className="bg-brand-600 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl">
          <h2 className="text-balance font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.01em] text-white md:text-[2.75rem]">
            Você treina. O SimulaOrdem corrige.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
            Depois do simulado, revise cada erro com gabarito, filtro por matéria e uma lista das questões que você
            salvou.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/[0.06]">
          <p className="border-b border-white/15 px-5 py-3.5 text-sm font-medium text-white">
            Pergunte sobre o seu simulado
          </p>
          <ul className="divide-y divide-white/10">
            {prompts.map((p) => (
              <li key={p} className="flex items-center gap-3 px-5 py-4 text-sm text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="bg-white px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
        <SectionHeading title="Feito para a reta final da OAB">
          1ª fase com simulados reais e estatísticas. 2ª fase com treino de peças processuais. Tudo integrado para você
          entrar na prova preparado.
        </SectionHeading>
        <ul className="grid content-start gap-x-8 sm:grid-cols-2">
          {trustItems.map((item) => (
            <li key={item} className="flex items-start gap-3 border-t border-slate-200 py-4 text-sm font-medium text-ink">
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CtaSection({ ctaTo, ctaLabel, onCtaClick }: { ctaTo: string; ctaLabel: string; onCtaClick?: () => void }) {
  const items = [
    'Grátis: 20 flashcards por dia, 1 simulado completo e 1 express por mês',
    'Termômetro OAB e tutor IA com 5 explicações por dia',
    `${LAUNCH_OFFER_LABEL}: Pro de R$ ${PROMO_PRICING.pro.compareAt} por R$ ${PROMO_PRICING.pro.price}/mês`,
  ]

  return (
    <section className="bg-brand-600 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-balance font-display text-[2.25rem] font-medium leading-[1.05] tracking-[-0.01em] text-white md:text-[3.25rem]">
            Entre na prova sabendo o seu ritmo.
          </h2>
          <ul className="mt-8 space-y-3 text-white/80">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm md:text-base">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <Link
            to={ctaTo}
            onClick={onCtaClick}
            className="inline-flex min-h-14 items-center rounded-xl bg-white px-8 text-base font-semibold text-brand-600 transition-colors duration-150 hover:bg-brand-50"
          >
            {ctaLabel}
          </Link>
          <Link to="/planos" className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
            Comparar planos
          </Link>
        </div>
      </div>
    </section>
  )
}

function CheckList({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted md:text-base">
          <CheckIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="text-brand-600" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

function ClockIcon() {
  return (
    <FeatureIcon>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </FeatureIcon>
  )
}

function ChartIcon() {
  return (
    <FeatureIcon>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 5-7" />
    </FeatureIcon>
  )
}

function RefreshIcon() {
  return (
    <FeatureIcon>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </FeatureIcon>
  )
}

function ScaleIcon() {
  return (
    <FeatureIcon>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7l-3 6h6L5 7z" />
      <path d="M19 7l-3 6h6l-3-6z" />
    </FeatureIcon>
  )
}

function CheckIcon({ className = 'mt-0.5 h-5 w-5 shrink-0 text-brand-500' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
