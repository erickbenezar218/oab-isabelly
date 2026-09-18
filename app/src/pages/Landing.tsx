import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  AnimatedBars,
  Float,
  HeroBackdrop,
  Reveal,
  useInView,
  useScrolled,
  useTickingTimer,
} from '../components/landing/motion'
import { OabTermometroDemo } from '../components/OabTermometro'

const features = [
  {
    icon: ClockIcon,
    title: 'Simulado realista',
    desc: '80 questões e 5 horas — ritmo real da prova objetiva.',
  },
  {
    icon: ScaleIcon,
    title: '2ª fase — Adivinhe a peça',
    desc: 'Leia o caso e identifique a peça processual correta.',
  },
  {
    icon: ChartIcon,
    title: 'Desempenho por matéria',
    desc: 'Veja onde errar menos antes do exame.',
  },
  {
    icon: RefreshIcon,
    title: 'Revisão de erros',
    desc: 'Estude questão por questão o que errou no simulado.',
  },
]

const trustItems = [
  '1.120+ questões oficiais da OAB',
  'Treino de peças da 2ª fase',
  'Progresso salvo na nuvem',
  'Preparação completa — 1ª e 2ª fase',
]

export default function Landing() {
  const { user } = useAuth()
  const ctaTo = user ? '/app' : '/login'
  const ctaLabel = user ? 'Abrir o app' : 'Começar grátis'

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-ink">
      <LandingHeader ctaTo={ctaTo} ctaLabel={ctaLabel} />

      <main>
        <Hero ctaTo={ctaTo} ctaLabel={ctaLabel} />
        <WhySection />
        <TermometroSection ctaTo={ctaTo} />
        <DesempenhoSection />
        <AiLearningSection />
        <DarkFeature />
        <TrustSection />
        <CtaSection ctaTo={ctaTo} ctaLabel={ctaLabel} />
      </main>

      <LandingFooter />
    </div>
  )
}

function LandingHeader({ ctaTo, ctaLabel }: { ctaTo: string; ctaLabel: string }) {
  const scrolled = useScrolled()

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md transition-all duration-300 safe-top ${
        scrolled ? 'landing-header-scrolled py-3' : 'py-4'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
          <img src="/logo.svg" alt="SimulaOrdem" className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {[
            { href: '#recursos', label: 'Recursos' },
            { href: '#ia', label: 'IA' },
            { href: '#desempenho', label: 'Desempenho' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="relative transition-colors duration-200 hover:text-brand-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-brand-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </a>
          ))}
          <Link to="/planos" className="transition-colors duration-200 hover:text-brand-600">
            Planos
          </Link>
        </nav>
        <Link
          to={ctaTo}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:bg-brand-700 hover:shadow-lg active:scale-[0.98]"
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  )
}

function Hero({ ctaTo, ctaLabel }: { ctaTo: string; ctaLabel: string }) {
  return (
    <section className="relative bg-white px-4 py-16 md:px-8 md:py-24">
      <HeroBackdrop />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="landing-hero-enter landing-hero-enter-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">
            OAB · 1ª e 2ª fase
          </p>
          <h1 className="landing-hero-enter landing-hero-enter-2 mt-4 text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
            Preparação completa. Do objetivo à peça processual.
          </h1>
          <p className="landing-hero-enter landing-hero-enter-3 mt-5 max-w-lg text-lg leading-relaxed text-muted">
            Simulados de 80 questões, flashcards, cronograma diário, tutor IA e treino de peças da 2ª fase — tudo no celular.
          </p>
          <div className="landing-hero-enter landing-hero-enter-4 mt-8 flex flex-wrap gap-3">
            <Link
              to={ctaTo}
              className="landing-cta-pulse inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-brand-700 hover:shadow-xl active:scale-[0.98]"
            >
              {ctaLabel}
              <ArrowIcon />
            </Link>
            <a
              href="#recursos"
              className="inline-flex items-center rounded-xl border border-slate-300 px-6 py-3.5 font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-surface-700"
            >
              Ver recursos
            </a>
          </div>
          <div className="landing-hero-enter landing-hero-enter-5 mt-10 flex flex-wrap gap-6 text-sm text-muted">
            {['1.120+ questões', 'Peças 2ª fase', 'Grátis para começar'].map((item, i) => (
              <span
                key={item}
                className="landing-stat-ticker flex items-center gap-2"
                style={{ animationDelay: `${0.6 + i * 0.12}s` }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <Float speed="slow" delay={-2} className="relative">
          <SimuladoMockup />
        </Float>
      </div>
    </section>
  )
}

function SimuladoMockup() {
  const timer = useTickingTimer(4 * 3600 + 12 * 60 + 8)

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="landing-glow-pulse absolute -inset-4 rounded-3xl bg-brand-50/80 blur-2xl" />
      <div className="card relative overflow-hidden rounded-3xl p-5 shadow-lg transition-shadow duration-500 hover:shadow-2xl">
        <div className="pointer-events-none absolute inset-0 landing-shimmer opacity-30" />

        <div className="relative flex items-center justify-between text-xs text-muted">
          <span className="font-medium text-brand-600">Simulado · 42º Exame</span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold tabular-nums text-brand-600">⏱ {timer}</span>
        </div>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-surface-700">
          <div className="landing-progress-animate h-full rounded-full bg-brand-500" />
        </div>
        <p className="relative mt-2 text-[11px] text-muted">Questão 42 de 80 · Ritmo ideal</p>

        <div className="relative mt-5 rounded-2xl bg-surface-900 p-4">
          <p className="text-xs font-medium text-brand-500">Direito Constitucional</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Acerca dos direitos e garantias fundamentais, assinale a alternativa correta...
          </p>
          <div className="mt-4 space-y-2">
            {['A', 'B', 'C', 'D'].map((letra, i) => (
              <div
                key={letra}
                className={`rounded-xl border px-3 py-2 text-xs transition-all duration-300 ${
                  i === 1
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-2 ring-brand-200/60'
                    : 'border-slate-200 bg-white text-muted hover:border-slate-300'
                }`}
              >
                <span className="mr-2 font-bold">{letra})</span>
                Alternativa de exemplo
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-4 gap-2">
          {[38, 39, 40, 41, 42, 43, 44, 45].map((n) => (
            <div
              key={n}
              className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-transform duration-300 ${
                n === 42
                  ? 'scale-105 bg-brand-600 text-white shadow-md'
                  : n < 42
                    ? 'bg-green-50 text-green-700'
                    : 'bg-surface-700 text-muted'
              }`}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WhySection() {
  return (
    <section id="recursos" className="bg-surface-900 px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Recursos</p>
          <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Por que SimulaOrdem?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Treino no formato real da prova, com dados que mostram onde você precisa melhorar.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 90} className="h-full">
              <div className="landing-card-lift card h-full rounded-2xl p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
                  <Icon />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function TermometroSection({ ctaTo }: { ctaTo: string }) {
  return (
    <section id="termometro" className="border-y border-slate-100 bg-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <Reveal direction="left">
          <OabTermometroDemo />
        </Reveal>
        <Reveal direction="right" delay={100}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Termômetro OAB</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Você passaria hoje?
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Com base no seu último simulado (ou no desempenho geral), o termômetro projeta quantos acertos você teria em
            80 questões — a meta oficial da OAB é <strong className="text-ink">40 acertos</strong>.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>• Atualiza automaticamente após cada simulado</li>
            <li>• Disponível no plano grátis, web e app iOS</li>
            <li>• Mostra se você está frio, esquentando ou aprovado</li>
          </ul>
          <Link
            to={ctaTo}
            className="btn-primary mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
          >
            Ver meu termômetro
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

const materiasMock = [
  { nome: 'Constitucional', pct: 72 },
  { nome: 'Administrativo', pct: 58 },
  { nome: 'Civil', pct: 45 },
  { nome: 'Penal', pct: 63 },
  { nome: 'Ética', pct: 81 },
]

function DesempenhoSection() {
  return (
    <section id="desempenho" className="bg-surface-900 px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal direction="left">
          <DesempenhoMockup />
        </Reveal>

        <Reveal direction="right" delay={120}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Desempenho</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">Veja seu desempenho por matéria</h2>
            <p className="mt-4 text-lg font-medium text-brand-600">Saiba exatamente onde você precisa estudar mais.</p>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">
              Gráficos claros mostram seu percentual de acerto em cada matéria — Constitucional, Civil, Penal, Ética e todas as
              outras. Sem termos complicados: você vê onde vai bem e onde precisa reforçar antes da prova.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Percentual de acerto por matéria, atualizado a cada questão',
                'Identifique suas matérias mais fracas de relance',
                'Acompanhe sua evolução ao longo dos simulados',
              ].map((item, i) => (
                <Reveal key={item} delay={200 + i * 80} as="li" className="flex items-start gap-3 text-sm text-muted">
                  <CheckIcon />
                  <span className="pt-0.5">{item}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function DesempenhoMockup() {
  const { ref, inView } = useInView(0.2)

  return (
    <div ref={ref as RefObject<HTMLDivElement>} className="relative mx-auto w-full max-w-md">
      <div className="landing-glow-pulse absolute -inset-4 rounded-3xl bg-brand-50/80 blur-2xl" />
      <Float speed="gentle" delay={-3}>
        <div className="card relative overflow-hidden rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Desempenho por matéria</p>
              <p className="text-xs text-muted">Últimos simulados e flashcards</p>
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">62% geral</span>
          </div>

          <div className="mt-6">
            <AnimatedBars items={materiasMock} inView={inView} />
          </div>

          <Reveal delay={400}>
            <div className="mt-6 rounded-2xl bg-brand-50 p-3">
              <p className="text-xs font-medium text-brand-700">💡 Reforce: Direito Civil — 45% de acerto</p>
            </div>
          </Reveal>
        </div>
      </Float>
    </div>
  )
}

const aiBenefits = [
  'Explica por que você errou — em linguagem clara, sem juridiquês desnecessário',
  'Aponta o fundamento jurídico por trás da alternativa correta',
  'Sugere o que revisar na matéria antes do próximo simulado',
]

function AiLearningSection() {
  return (
    <section id="ia" className="relative overflow-hidden bg-white px-4 py-16 md:px-8 md:py-20">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-brand-50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-brand-100/40 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal direction="left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Inteligência artificial</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">Estude com inteligência artificial</h2>
            <p className="mt-4 text-lg font-medium text-brand-600">Cada erro em questões, você aprende.</p>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">
              Errou no simulado ou no flashcard? A IA analisa sua resposta, compara com o gabarito e te explica o raciocínio — para
              você não repetir o mesmo erro na prova.
            </p>

            <ul className="mt-8 space-y-4">
              {aiBenefits.map((item, i) => (
                <Reveal key={item} delay={i * 100} as="li" className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <SparklesIcon />
                  </div>
                  <p className="pt-2 text-sm leading-relaxed text-muted">{item}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal direction="right" delay={150}>
          <Float speed="slow" delay={-1}>
            <AiTutorMockup />
          </Float>
        </Reveal>
      </div>
    </section>
  )
}

function AiTutorMockup() {
  const { ref, inView } = useInView(0.25)

  return (
    <div ref={ref as RefObject<HTMLDivElement>} className="relative mx-auto w-full max-w-md">
      <div className="landing-glow-pulse absolute -inset-4 rounded-3xl bg-brand-50/60 blur-2xl" />
      <div className="card relative overflow-hidden rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <div className="flex h-9 w-9 animate-pulse items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <SparklesIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Tutor IA · Revisão de erro</p>
            <p className="text-xs text-muted">Questão 42 · Direito Constitucional</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Reveal delay={0}>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">Sua resposta: B</p>
              <p className="mt-1 text-xs text-red-800/80">Gabarito correto: C</p>
            </div>
          </Reveal>

          <div className={`rounded-2xl border border-slate-200 bg-surface-900 p-4 ${inView ? 'landing-ai-typing-visible landing-ai-typing' : 'opacity-0'}`}>
            <p className="text-xs font-medium text-brand-500">Explicação da IA</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              Você confundiu direito de liberdade com direito de igualdade. A alternativa C está correta porque trata da reserva
              legal dos direitos fundamentais, conforme o art. 5º, §2º da CF/88.
            </p>
            <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2">
              <p className="text-xs font-medium text-brand-600">💡 Revisar: princípios constitucionais · reserva legal</p>
            </div>
          </div>

          <div className="flex gap-2">
            {['Entendi', 'Salvar para revisar', 'Próximo erro'].map((label, i) => (
              <div
                key={label}
                className={`rounded-xl px-3 py-2 text-center text-[11px] font-medium transition-transform duration-300 hover:-translate-y-0.5 ${
                  i === 0 ? 'bg-brand-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-muted'
                }`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {label}
              </div>
            ))}
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
    <section className="landing-gradient-flow relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 px-4 py-16 md:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
        <div className="absolute -left-10 top-1/4 h-40 w-40 rounded-full bg-white blur-3xl" />
        <div className="absolute -right-10 bottom-1/4 h-56 w-56 rounded-full bg-brand-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-200">Revisão inteligente</p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Você treina. O SimulaOrdem corrige.</h2>
          <p className="mt-4 text-brand-100">
            Depois do simulado, revise cada erro com gabarito, filtro por matéria e lista de questões salvas.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-12 max-w-xl">
          <Float speed="gentle">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-sm">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-medium text-white">Revisão do simulado</p>
              </div>
              <div className="space-y-2 p-4">
                {prompts.map((p, i) => (
                  <div
                    key={p}
                    className="landing-prompt-slide cursor-default rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/40 hover:bg-white/10"
                    style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </Float>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section
      className="relative overflow-hidden px-4 py-16 md:px-8 md:py-20"
      style={{ background: 'linear-gradient(135deg, #EBE8D8 0%, #F5F3EA 50%, #EBE8D8 100%)' }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <Reveal direction="left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Confiança</p>
            <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Feito para a reta final da OAB</h2>
            <p className="mt-4 text-muted">
              1ª fase com simulados reais e estatísticas. 2ª fase com treino de peças processuais. Tudo integrado para você
              entrar na prova preparado.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {trustItems.map((item, i) => (
            <Reveal key={item} delay={i * 80}>
              <div className="landing-card-lift card flex items-start gap-3 rounded-2xl p-4">
                <CheckIcon />
                <p className="text-sm font-medium text-ink">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection({ ctaTo, ctaLabel }: { ctaTo: string; ctaLabel: string }) {
  return (
    <section className="landing-gradient-flow relative overflow-hidden bg-brand-600 px-4 py-16 md:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-brand-400/20 blur-3xl" />
      </div>

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">Entre na prova sabendo seu ritmo</h2>
        <ul className="mt-6 space-y-2 text-brand-100">
          {['✓ 1 simulado grátis por mês', '✓ Flashcards e peças da 2ª fase grátis', '✓ Pro a partir de R$ 24,90/mês'].map(
            (item, i) => (
              <li key={item} className="landing-stat-ticker" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                {item}
              </li>
            ),
          )}
        </ul>
        <Link
          to={ctaTo}
          className="landing-cta-pulse mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-brand-600 transition-all duration-300 hover:scale-[1.04] hover:bg-brand-50 hover:shadow-2xl active:scale-[0.98]"
        >
          {ctaLabel}
          <ArrowIcon />
        </Link>
      </Reveal>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/logo.svg" alt="SimulaOrdem" className="h-10 w-auto" />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Preparação completa para a OAB — simulados, peças processuais e estudo inteligente.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Produto</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/login" className="transition-colors hover:text-brand-600">
                Entrar
              </Link>
            </li>
            <li>
              <Link to="/planos" className="transition-colors hover:text-brand-600">
                Planos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/termos" className="transition-colors hover:text-brand-600">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="transition-colors hover:text-brand-600">
                Privacidade
              </Link>
            </li>
            <li>
              <a href="mailto:suporte@simulaordem.com.br" className="transition-colors hover:text-brand-600">
                suporte@simulaordem.com.br
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-muted-light">
        © {new Date().getFullYear()} SimulaOrdem · R E BENEZAR DE SOUZA LTDA
      </p>
    </footer>
  )
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 5-7" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7l-3 6h6L5 7z" />
      <path d="M19 7l-3 6h6l-3-6z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 shrink-0 text-brand-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
