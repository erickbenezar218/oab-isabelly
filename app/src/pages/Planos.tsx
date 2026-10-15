import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PromoPrice } from '../components/PromoPrice'
import { apiBillingConfig, type BillingConfig } from '../lib/api'
import VslSection from '../components/landing/VslSection'
import { SiteFooter, SiteHeader } from '../components/landing/SiteChrome'
import { LAUNCH_OFFER_LABEL, PRO_BONUS_TEASER, type PaidPlanId } from '../lib/pricing'

type PlanId = 'free' | 'pro' | 'reta'

const plans: {
  id: PlanId
  name: string
  price?: string
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
    description: 'Para conhecer a plataforma antes de decidir.',
    features: [
      '20 flashcards por dia',
      '1 simulado completo e 1 express por mês',
      'Professor IA com 5 explicações por dia',
      'Termômetro OAB (visão básica)',
      '2ª fase liberada após passar na 1ª fase oficial',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Mais escolhido',
    featured: true,
    description: 'Tudo para treinar como na prova real, sem limites.',
    features: [
      'Simulados ilimitados: completo, express e oficial',
      'Professor IA ilimitado em toda questão',
      'Chat com o professor IA por questão',
      'Revisão inteligente de erros',
      'Cronograma e trilha do dia',
      'Selo "Passaria hoje" e gamificação',
    ],
    cta: 'Assinar o Pro',
  },
  {
    id: 'reta',
    name: 'Reta Final',
    badge: 'Melhor custo',
    description: 'Para os 90 dias antes da prova.',
    features: ['Tudo do plano Pro', 'Acesso por 3 meses', 'Foco total na reta final'],
    cta: 'Garantir a Reta Final',
  },
]

type Cell = string | boolean

const comparison: { label: string; free: Cell; pro: Cell; reta: Cell }[] = [
  { label: 'Flashcards', free: '20 por dia', pro: 'Ilimitados', reta: 'Ilimitados' },
  { label: 'Simulados completos', free: '1 por mês', pro: 'Ilimitados', reta: 'Ilimitados' },
  { label: 'Simulado express (40 questões)', free: '1 por mês', pro: 'Ilimitado', reta: 'Ilimitado' },
  { label: 'Explicações do professor IA', free: '5 por dia', pro: 'Ilimitadas', reta: 'Ilimitadas' },
  { label: 'Chat IA por questão', free: false, pro: true, reta: true },
  { label: 'Histórico de simulados', free: 'Último simulado', pro: 'Completo', reta: 'Completo' },
  { label: 'Revisão de erros', free: false, pro: true, reta: true },
  { label: 'Desempenho por matéria', free: false, pro: 'Completo', reta: 'Completo' },
  { label: 'Treino de peças da 2ª fase', free: true, pro: true, reta: true },
  { label: 'Cronograma diário', free: false, pro: true, reta: true },
]

const faqs = [
  {
    q: 'Como funciona o pagamento?',
    a: 'Cartão, PIX ou boleto via Asaas. Depois de escolher o plano, você vai para o checkout seguro.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. No Pro mensal você cancela a qualquer momento, sem multa.',
  },
  {
    q: 'O plano grátis é suficiente para testar?',
    a: 'Sim. São 20 flashcards por dia, 1 simulado completo e 1 express por mês, e 5 explicações da IA por dia, sem cartão.',
  },
  {
    q: 'Qual plano escolher na reta final?',
    a: 'Se faltam até 3 meses para a prova, o Reta Final sai mais barato que três meses de Pro.',
  },
]

const h2 = 'text-balance font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.01em] text-ink md:text-[2.75rem]'

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
    <div className="landing-page min-h-dvh bg-white text-ink">
      <SiteHeader ctaTo={ctaTo} ctaLabel={user ? 'Abrir o app' : 'Entrar'} current="planos" />

      <main>
        <section className="px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <h1 className="text-balance font-display text-[2.5rem] font-medium leading-[1.04] tracking-[-0.02em] text-ink sm:text-6xl">
                Escolha como treinar até o dia da prova
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Comece grátis com flashcards e peças da 2ª fase. Quando quiser, libere simulados ilimitados, cronograma e
                tutor IA.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-600">
                {LAUNCH_OFFER_LABEL}: você paga o preço promocional, não o valor riscado.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  active={!!user && activePlan === plan.id}
                  ctaTo={ctaTo}
                  billingEnabled={billing?.enabled ?? false}
                  billingSandbox={billing?.sandbox ?? false}
                />
              ))}
            </div>

            <p className="mt-8 flex items-center gap-2 text-sm text-muted">
              <LockIcon />
              Pagamento seguro via Asaas, com cartão, PIX ou boleto.
            </p>
            {billing?.sandbox && <p className="mt-2 text-xs text-amber-700">Ambiente de testes (Sandbox) ativo</p>}
          </div>
        </section>

        <section className="bg-surface-900 px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className={h2}>O que cada plano inclui</h2>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="px-5 py-4 font-semibold text-ink">
                      Recurso
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold text-muted">
                      Grátis
                    </th>
                    <th scope="col" className="bg-brand-50 px-5 py-4 font-semibold text-brand-700">
                      Pro
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold text-muted">
                      Reta Final
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <th scope="row" className="px-5 py-3.5 font-medium text-ink">
                        {row.label}
                      </th>
                      <td className="px-5 py-3.5 text-muted">
                        <CellValue value={row.free} />
                      </td>
                      <td className="bg-brand-50/60 px-5 py-3.5 font-medium text-brand-700">
                        <CellValue value={row.pro} />
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        <CellValue value={row.reta} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <h2 className={h2}>Perguntas frequentes</h2>
            <div className="border-t border-slate-200">
              {faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-slate-200">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <PlusIcon />
                  </summary>
                  <p className="pb-5 pr-10 text-sm leading-relaxed text-muted md:text-base">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <VslSection variant="planos" />

        <section className="bg-brand-600 px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-balance font-display text-[2.25rem] font-medium leading-[1.05] tracking-[-0.01em] text-white md:text-[3.25rem]">
                Ainda em dúvida? Comece pelo grátis.
              </h2>
              <p className="mt-5 max-w-xl text-white/80 md:text-lg">
                20 flashcards por dia, 1 simulado completo e 1 express por mês e 5 explicações da IA por dia. Sem cartão.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to={ctaTo}
                className="inline-flex min-h-14 items-center rounded-xl bg-white px-8 font-semibold text-brand-600 transition-colors duration-150 hover:bg-brand-50"
              >
                {user ? 'Ir para o app' : 'Criar conta grátis'}
              </Link>
              <a
                href="mailto:suporte@simulaordem.com.br"
                className="inline-flex min-h-14 items-center rounded-xl border border-white/30 px-8 font-semibold text-white transition-colors duration-150 hover:bg-white/10"
              >
                Falar com o suporte
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
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
  const isPaid = plan.id === 'pro' || plan.id === 'reta'
  const checkoutTo = isPaid
    ? billingEnabled
      ? `/planos/checkout?plan=${plan.id}`
      : `mailto:suporte@simulaordem.com.br?subject=Assinatura%20${plan.name}`
    : ctaTo
  const isFeatured = plan.featured

  const ctaClass = `mt-8 flex min-h-12 flex-col items-center justify-center rounded-xl px-4 text-center text-sm font-semibold transition-colors duration-150 ${
    isFeatured
      ? 'bg-white text-brand-600 hover:bg-brand-50'
      : isPaid
        ? 'bg-brand-600 text-white hover:bg-brand-700'
        : 'border border-slate-300 bg-white text-ink hover:border-brand-400 hover:bg-surface-900'
  }`

  return (
    <article
      className={`flex flex-col rounded-3xl p-6 md:p-8 ${
        isFeatured
          ? 'bg-brand-600 text-white shadow-[0_24px_60px_-28px_rgba(15,42,39,0.6)]'
          : 'border border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className={`font-display text-3xl font-medium ${isFeatured ? 'text-white' : 'text-ink'}`}>{plan.name}</h2>
        {active ? (
          <span
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              isFeatured ? 'bg-white/15 text-white' : 'bg-green-50 text-green-800'
            }`}
          >
            Seu plano
          </span>
        ) : (
          plan.badge && (
            <span
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isFeatured ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-700'
              }`}
            >
              {plan.badge}
            </span>
          )
        )}
      </div>
      <p className={`mt-2 text-sm ${isFeatured ? 'text-white/75' : 'text-muted'}`}>{plan.description}</p>

      <div className={`mt-6 border-t pt-6 ${isFeatured ? 'border-white/15' : 'border-slate-200'}`}>
        {isPaid ? (
          <PromoPrice planId={plan.id as PaidPlanId} featured={isFeatured} />
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-medium text-muted">R$</span>
              <span className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-ink">
                {plan.price}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">Sem cartão de crédito</p>
          </div>
        )}
      </div>

      <ul className={`mt-6 flex-1 space-y-3 ${isFeatured ? 'text-white/85' : 'text-muted'}`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <CheckIcon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${isFeatured ? 'text-brand-300' : 'text-brand-500'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isPaid && (
        <p
          className={`mt-6 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
            isFeatured ? 'bg-white/10 text-white/80' : 'bg-surface-900 text-muted'
          }`}
        >
          {PRO_BONUS_TEASER}
        </p>
      )}

      {!isPaid || billingEnabled ? (
        <Link to={checkoutTo} className={ctaClass}>
          {plan.cta}
          {isPaid && billingSandbox && <span className="text-[11px] font-normal opacity-80">Sandbox</span>}
        </Link>
      ) : (
        <a href={checkoutTo} className={ctaClass}>
          {plan.cta}
        </a>
      )}
    </article>
  )
}

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <CheckIcon className="h-[18px] w-[18px] text-brand-500" />
        <span className="sr-only">Incluído</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden className="text-muted-light">
          –
        </span>
        <span className="sr-only">Não incluído</span>
      </>
    )
  }
  return <>{value}</>
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-brand-500 transition-transform duration-200 group-open:rotate-45"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
