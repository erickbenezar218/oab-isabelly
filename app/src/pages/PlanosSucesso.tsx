import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PlanosSucesso() {
  const { refreshSession, user } = useAuth()
  const [params] = useSearchParams()
  const plan = params.get('plan')

  useEffect(() => {
    refreshSession().catch(() => {})
    const t = setInterval(() => refreshSession().catch(() => {}), 5000)
    return () => clearInterval(t)
  }, [refreshSession])

  const isPro = user?.plan === 'pro'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-900 px-4 text-center">
      <div className="card max-w-md rounded-2xl p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
        <h1 className="mt-4 text-2xl font-bold text-ink">Pagamento recebido!</h1>
        <p className="mt-2 text-sm text-muted">
          {plan === 'reta'
            ? 'Seu acesso Pro por 3 meses está sendo liberado.'
            : 'Sua assinatura Pro está sendo ativada.'}
        </p>

        {isPro ? (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
            Pro ativo — pode usar simulados ilimitados e Professor IA completo.
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted">
            No sandbox, confirme o pagamento no painel Asaas se ainda não fez. Esta página atualiza sozinha.
          </p>
        )}

        <Link
          to="/app"
          className="mt-6 inline-block w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Abrir o app
        </Link>
        <Link to="/planos" className="mt-3 block text-sm text-muted hover:text-brand-600">
          Ver planos
        </Link>
      </div>
    </div>
  )
}
