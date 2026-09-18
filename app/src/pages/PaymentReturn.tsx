import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { appDeepLink } from '../lib/deepLink'

/**
 * Ponte Asaas → app nativo (carregada no browser in-app após pagamento).
 * Redireciona para com.simulaordem.app://planos/sucesso
 */
export default function PaymentReturn() {
  const [params] = useSearchParams()
  const plan = params.get('plan') === 'reta' ? 'reta' : 'pro'
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    window.location.href = appDeepLink(`/planos/sucesso?plan=${plan}`)
    const t = window.setTimeout(() => setShowFallback(true), 2200)
    return () => window.clearTimeout(t)
  }, [plan])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-900 px-6 text-center">
      <div className="card max-w-sm rounded-2xl p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <span className="text-xl">↩</span>
        </div>
        <h1 className="mt-4 text-lg font-bold text-ink">Voltando ao SimulaOrdem…</h1>
        <p className="mt-2 text-sm text-muted">
          {showFallback
            ? 'Se o app não abriu sozinho, toque no botão abaixo.'
            : 'Aguarde um instante enquanto redirecionamos você.'}
        </p>
        {showFallback && (
          <>
            <a
              href={appDeepLink(`/planos/sucesso?plan=${plan}`)}
              className="btn-primary mt-6 block py-3 text-sm"
            >
              Abrir SimulaOrdem
            </a>
            <Link to={`/planos/sucesso?plan=${plan}`} className="mt-3 block text-sm text-muted hover:text-brand-600">
              Continuar no site
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
