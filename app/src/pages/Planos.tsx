import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Planos() {
  const { user, limits } = useAuth()
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-surface-800 p-5 text-center">
        <h1 className="text-xl font-bold text-white">Planos SimulaOrdem</h1>
        <p className="mt-2 text-sm text-purple-300/70">Pagamento via Asaas em breve. Cartão, PIX ou boleto.</p>
      </section>

      <div className="grid gap-4">
        <PlanCard
          name="Grátis"
          price="R$ 0"
          active={!isPro}
          features={['Flashcards ilimitados', '1 simulado por mês', 'Histórico do último simulado']}
        />
        <PlanCard
          name="Pro"
          price="R$ 24,90/mês"
          highlight
          active={isPro}
          features={['Simulados ilimitados', 'Histórico completo', 'Revisão detalhada de erros', 'Estatísticas completas']}
        />
        <PlanCard
          name="Reta Final"
          price="R$ 59,90 / 3 meses"
          active={false}
          features={['Tudo do Pro', 'Ideal para os 90 dias antes da prova', 'Melhor custo-benefício']}
        />
      </div>

      {!isPro && (
        <p className="rounded-xl bg-brand-600/20 p-4 text-center text-sm text-brand-200">
          Integração Asaas em breve. Enquanto isso, entre em contato:{' '}
          <a href="mailto:suporte@simulaordem.com.br" className="underline">
            suporte@simulaordem.com.br
          </a>
        </p>
      )}

      <Link to="/" className="block text-center text-sm text-purple-300/60 underline">
        Voltar ao início
      </Link>
    </div>
  )
}

function PlanCard({
  name,
  price,
  features,
  highlight,
  active,
}: {
  name: string
  price: string
  features: string[]
  highlight?: boolean
  active?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? 'border border-brand-500 bg-brand-600/10' : 'bg-surface-800'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-white">{name}</h2>
          <p className="mt-1 text-lg font-semibold text-brand-300">{price}</p>
        </div>
        {active && <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-300">Seu plano</span>}
      </div>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="text-sm text-purple-200/80">
            ✓ {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
