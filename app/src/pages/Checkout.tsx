import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiBillingCheckout, apiBillingConfig, type BillingConfig } from '../lib/api'

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const planLabels = {
  pro: { name: 'Pro', desc: 'Assinatura mensal — cancele quando quiser' },
  reta: { name: 'Reta Final', desc: '3 meses de acesso Pro completo' },
}

export default function Checkout() {
  const { user, token, loading } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const plan = params.get('plan') === 'reta' ? 'reta' : params.get('plan') === 'pro' ? 'pro' : null

  const [config, setConfig] = useState<BillingConfig | null>(null)
  const [cpf, setCpf] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiBillingConfig().then(setConfig).catch(() => setConfig({ enabled: false, sandbox: true, plans: {} as BillingConfig['plans'] }))
  }, [])

  if (!loading && !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(`/planos/checkout?plan=${plan ?? 'pro'}`)}`} replace />
  }

  if (!plan) {
    return <Navigate to="/planos" replace />
  }

  const info = planLabels[plan]
  const price = config?.plans[plan]?.value

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setError('')
    setBusy(true)
    try {
      const { checkoutUrl } = await apiBillingCheckout(token, plan!, cpf)
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar pagamento')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface-900 text-ink">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/planos">
            <img src="/logo.svg" alt="SimulaOrdem" className="h-8 w-auto" />
          </Link>
          <Link to="/planos" className="text-sm text-muted hover:text-brand-600">
            ← Planos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10">
        {config?.sandbox && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Modo Sandbox Asaas</strong> — pagamento de teste. No painel sandbox, use &quot;Confirmar pagamento&quot; após
            pagar.
          </div>
        )}

        {!config?.enabled && config !== null && (
          <div className="card rounded-2xl p-6 text-center">
            <p className="text-muted">Pagamentos em configuração. Fale com suporte@simulaordem.com.br.</p>
            <Link to="/planos" className="mt-4 inline-block text-sm font-semibold text-brand-600">
              Voltar aos planos
            </Link>
          </div>
        )}

        {config?.enabled && (
          <div className="card rounded-2xl p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Checkout</p>
            <h1 className="mt-2 text-2xl font-bold">{info.name}</h1>
            <p className="mt-1 text-sm text-muted">{info.desc}</p>

            {price != null && (
              <p className="mt-4 text-3xl font-extrabold text-ink">
                R$ {price.toFixed(2).replace('.', ',')}
                {plan === 'pro' && <span className="text-base font-medium text-muted">/mês</span>}
              </p>
            )}

            <p className="mt-2 text-xs text-muted">
              Pagamento via Asaas · Cartão, PIX ou boleto · Cobrança em nome de R E BENEZAR DE SOUZA LTDA
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-ink">
                  CPF do titular
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <p className="text-xs text-muted">
                E-mail da conta: <strong>{user?.email}</strong>
              </p>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? 'Gerando link…' : 'Ir para pagamento →'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="mt-4 w-full text-center text-sm text-muted hover:text-brand-600"
            >
              Cancelar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
