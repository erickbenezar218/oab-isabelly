import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiBonusKit, type BonusKitConfig } from '../lib/api'
import { PRO_BONUS_GUIDES, PRO_BONUS_TEASER } from '../lib/pricing'

export default function KitOab() {
  const { token, user, loading, limits } = useAuth()
  const [kit, setKit] = useState<BonusKitConfig | null>(null)
  const [kitError, setKitError] = useState('')
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'

  useEffect(() => {
    if (!token || !isPro) return
    apiBonusKit(token)
      .then(setKit)
      .catch((e) => setKitError(e instanceof Error ? e.message : 'Erro ao carregar kit.'))
  }, [token, isPro])

  return (
    <div className="min-h-dvh bg-surface-900 text-ink">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/">
            <img src="/logo.svg" alt="SimulaOrdem" className="h-8 w-auto" />
          </Link>
          <Link to={isPro ? '/app' : '/planos'} className="text-sm font-medium text-brand-600 hover:underline">
            {isPro ? 'Ir ao app →' : 'Assinar Pro →'}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Bônus Pro</p>
        <h1 className="mt-2 text-3xl font-bold">Kit Aprovador OAB</h1>
        <p className="mt-3 text-muted">{PRO_BONUS_TEASER}</p>

        {!isPro && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Disponível após confirmação do pagamento Pro ou Reta Final. Você também recebe os PDFs por e-mail.{' '}
            <Link to="/planos" className="font-semibold text-brand-700 underline">
              Ver oferta
            </Link>
          </div>
        )}

        {kitError && isPro && (
          <p className="mt-4 text-sm text-red-600">{kitError}</p>
        )}

        {isPro && (
          <p className="mt-6 text-sm text-muted">
            Os 3 guias foram enviados em anexo no e-mail de boas-vindas Pro. Abra abaixo para ler online ou salvar como PDF
            de novo.
          </p>
        )}

        <ul className="mt-8 space-y-4">
          {(isPro ? (kit?.guides ?? kit?.pdfs ?? []) : PRO_BONUS_GUIDES).map((g) => (
            <li key={g.id} className="card rounded-2xl p-5">
              <h2 className="font-semibold text-ink">{g.title}</h2>
              <p className="mt-1 text-sm text-muted">{g.description}</p>
              {isPro ? (
                <Link
                  to={`/kit-oab/guia/${g.id}`}
                  className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
                >
                  Abrir guia · Salvar como PDF →
                </Link>
              ) : (
                <p className="mt-4 text-xs text-muted-light">Exclusivo plano Pro</p>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
