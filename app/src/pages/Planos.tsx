import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiBillingConfig, type BillingConfig } from '../lib/api'

type PlanId = 'free' | 'pro' | 'reta'

const plans: {
  id: PlanId
  name: string
  price: string
  period: string
  note?: string
  description: string
  badge?: string
  featured?: boolean
  features: string[]
  cta: string
}[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: '0',
    period: '',
    description: 'Ideal para conhecer a plataforma antes da prova.',
    features: [
      'Flashcards ilimitados',
      '1 simulado completo/mês + express ilimitado',
      'Professor IA — 20 explicações/dia',
      '2ª fase — adivinhe a peça',
      'Termômetro OAB (projeção de aprovação)',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '24,90',
    period: '/mês',
    badge: 'Mais popular',
    featured: true,
    description: 'Tudo que você precisa para treinar como na prova real.',
    features: [
      'Simulados ilimitados (completo + express + oficial)',
      'Professor IA ilimitado em toda questão',
      'Chat com o professor IA por questão',
      'Revisão inteligente de erros',
      'Cronograma + trilha do dia',
      'Badge "Passaria hoje" e gamificação',
    ],
    cta: 'Assinar Pro',
  },
  {
    id: 'reta',
    name: 'Reta Final',
    price: '59,90',
    period: '/3 meses',
    note: '≈ R$ 19,97/mês',
    badge: 'Melhor custo',
    description: 'Perfeito para os 90 dias antes da prova.',
    features: ['Tudo do plano Pro', 'Acesso por 3 meses', 'Foco total na reta final', 'Melhor custo-benefício'],
    cta: 'Garantir acesso',
  },
]

const comparison = [
  { label: 'Flashcards', free: 'Ilimitados', pro: 'Ilimitados', reta: 'Ilimitados' },
  { label: 'Simulados completos', free: '1/mês', pro: 'Ilimitados', reta: 'Ilimitados' },
  { label: 'Simulado express (40q)', free: 'Ilimitado', pro: 'Ilimitado', reta: 'Ilimitado' },
  { label: 'Professor IA (explicações)', free: '20/dia', pro: 'Ilimitado', reta: 'Ilimitado' },
  { label: 'Chat IA por questão', free: '—', pro: '✓', reta: '✓' },
  { label: 'Histórico', free: 'Último simulado', pro: 'Completo', reta: 'Completo' },
  { label: 'Revisão de erros', free: '—', pro: '✓', reta: '✓' },
  { label: 'Desempenho por matéria', free: 'Básico', pro: 'Completo', reta: 'Completo' },
  { label: '2ª fase — peças', free: '✓', pro: '✓', reta: '✓' },
  { label: 'Cronograma diário', free: '—', pro: '✓', reta: '✓' },
]

const faqs = [
  {
    q: 'Como funciona o pagamento?',
    a: 'Cartão, PIX ou boleto via Asaas. Após escolher o plano, você é redirecionado ao checkout seguro.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. No plano Pro mensal você cancela a qualquer momento, sem multa.',
  },
  {
    q: 'O plano grátis é suficiente para testar?',
    a: 'Sim. Você usa flashcards ilimitados e 1 simulado por mês para sentir o ritmo real da prova.',
  },
  {
    q: 'Qual plano escolher na reta final?',
    a: 'Se faltam até 3 meses para a prova, o plano Reta Final tem o melhor custo-benefício.',
  },
]

export default function Planos() {
  const { user, limits } = useAuth()
  const [billing, setBilling] = useState<BillingConfig | null>(null)
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'
  const ctaTo = user ? '/app' : '/login'

  useEffect(() => {
    apiBillingConfig().then(setBilling).catch(() => {})
  }, [])

  const activePlan: PlanId = isPro ? 'pro' : 'free'

  return (
    <div className="min-h-dvh bg-surface-900 text-ink">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md safe-top">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/">
            <img src="/logo.svg" alt="SimulaOrdem" className="h-9 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link to="/#recursos" className="hover:text-brand-600">
              Recursos
            </Link>
            <Link to="/#ia" className="hover:text-brand-600">
              IA
            </Link>
            <Link to="/#desempenho" className="hover:text-brand-600">
              Desempenho
            </Link>
            <span className="font-medium text-brand-600">Planos</span>
          </nav>
          <Link
            to={ctaTo}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {user ? 'Abrir o app' : 'Entrar'}
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-white px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Planos</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">Invista na sua aprovação</h1>
            <p className="mt-4 text-lg text-muted">
              Comece grátis com flashcards e peças da 2ª fase. Evolua para simulados ilimitados, cronograma e tutor IA.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                active={activePlan === plan.id}
                ctaTo={ctaTo}
                billingEnabled={billing?.enabled ?? false}
                billingSandbox={billing?.sandbox ?? false}
              />
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
            Pagamento seguro via Asaas · Cartão, PIX ou boleto · Sem pegadinhas
            {billing?.sandbox && (
              <span className="mt-2 block text-xs text-amber-700">Ambiente de testes (Sandbox) ativo</span>
            )}
          </p>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Compare</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">O que cada plano inclui</h2>
            </div>

            <div className="card mt-10 overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-surface-700/50">
                      <th className="px-5 py-4 font-semibold text-ink">Recurso</th>
                      <th className="px-5 py-4 font-semibold text-muted">Grátis</th>
                      <th className="px-5 py-4 font-semibold text-brand-600">Pro</th>
                      <th className="px-5 py-4 font-semibold text-muted">Reta Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-4 font-medium text-ink">{row.label}</td>
                        <td className="px-5 py-4 text-muted">{row.free}</td>
                        <td className="px-5 py-4 font-medium text-brand-700">{row.pro}</td>
                        <td className="px-5 py-4 text-muted">{row.reta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Dúvidas</p>
              <h2 className="mt-3 text-3xl font-bold text-ink">Perguntas frequentes</h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="card group rounded-2xl p-5">
                  <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {faq.q}
                      <span className="text-brand-500 transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-600 px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Ainda em dúvida? Comece grátis hoje</h2>
            <p className="mt-4 text-brand-100">Teste flashcards e 1 simulado por mês sem cartão de crédito.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to={ctaTo}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                {user ? 'Ir para o app' : 'Criar conta grátis'}
                <ArrowIcon />
              </Link>
              <a
                href="mailto:suporte@simulaordem.com.br"
                className="inline-flex items-center rounded-xl border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Falar com suporte
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to={user ? '/app' : '/'} className="text-sm text-muted underline hover:text-brand-600">
            ← Voltar ao início
          </Link>
          <p className="text-xs text-muted-light">© {new Date().getFullYear()} SimulaOrdem</p>
        </div>
      </footer>
    </div>
  )
}

function PlanCard({
  plan,
  active,
  ctaTo,
  billingEnabled,
  billingSandbox,
}: {
  plan: (typeof plans)[number]
  active: boolean
  ctaTo: string
  billingEnabled: boolean
  billingSandbox: boolean
}) {
  const checkoutTo =
    plan.id === 'pro' || plan.id === 'reta'
      ? billingEnabled
        ? `/planos/checkout?plan=${plan.id}`
        : `mailto:suporte@simulaordem.com.br?subject=Assinatura%20${plan.name}`
      : ctaTo
  const paidCtaNeedsLogin = (plan.id === 'pro' || plan.id === 'reta') && billingEnabled
  const isFeatured = plan.featured

  return (
    <article
      className={`relative flex flex-col rounded-3xl p-6 md:p-8 ${
        isFeatured
          ? 'overflow-hidden bg-brand-600 text-white shadow-xl lg:scale-[1.03] lg:shadow-2xl'
          : 'card transition hover:shadow-md'
      }`}
    >
      {isFeatured && <FeaturedPattern />}

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            {plan.badge && (
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  isFeatured ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600'
                }`}
              >
                {plan.badge}
              </span>
            )}
            <h2 className={`mt-3 text-xl font-bold ${isFeatured ? 'text-white' : 'text-ink'}`}>{plan.name}</h2>
            <p className={`mt-1 text-sm ${isFeatured ? 'text-brand-100' : 'text-muted'}`}>{plan.description}</p>
          </div>
          {active && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                isFeatured ? 'bg-white/20 text-white' : 'bg-green-50 text-green-700'
              }`}
            >
              Seu plano
            </span>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-end gap-1">
            <span className={`text-sm font-medium ${isFeatured ? 'text-brand-100' : 'text-muted'}`}>R$</span>
            <span className={`text-4xl font-extrabold tracking-tight ${isFeatured ? 'text-white' : 'text-ink'}`}>
              {plan.price}
            </span>
            {plan.period && (
              <span className={`mb-1 text-sm ${isFeatured ? 'text-brand-100' : 'text-muted'}`}>{plan.period}</span>
            )}
          </div>
          {plan.note && <p className={`mt-1 text-xs ${isFeatured ? 'text-brand-200' : 'text-brand-500'}`}>{plan.note}</p>}
        </div>

        <ul className={`mt-6 flex-1 space-y-3 ${isFeatured ? 'text-brand-50' : 'text-muted'}`}>
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <CheckIcon featured={isFeatured} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {plan.id === 'free' ? (
          <Link
            to={ctaTo}
            className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition ${
              isFeatured
                ? 'bg-white text-brand-600 hover:bg-brand-50'
                : 'border border-slate-300 bg-white text-ink hover:bg-surface-700'
            }`}
          >
            {plan.cta}
          </Link>
        ) : paidCtaNeedsLogin ? (
          <Link
            to={checkoutTo}
            className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition ${
              isFeatured
                ? 'bg-white text-brand-600 hover:bg-brand-50'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {plan.cta} →
            {billingSandbox && <span className="mt-1 block text-[10px] font-normal opacity-80">Sandbox</span>}
          </Link>
        ) : (
          <a
            href={checkoutTo}
            className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition ${
              isFeatured
                ? 'bg-white text-brand-600 hover:bg-brand-50'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {plan.cta} →
          </a>
        )}
      </div>
    </article>
  )
}

function FeaturedPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          -35deg,
          transparent,
          transparent 18px,
          #ffffff 18px,
          #ffffff 20px
        )`,
      }}
    />
  )
}

function CheckIcon({ featured }: { featured?: boolean }) {
  return (
    <svg
      className={`mt-0.5 shrink-0 ${featured ? 'text-brand-200' : 'text-brand-500'}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
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
