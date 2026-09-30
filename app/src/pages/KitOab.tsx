import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiBonusKit, type BonusKitConfig } from '../lib/api'
import { PRO_BONUS_TEASER } from '../lib/pricing'

export default function KitOab() {
  const { user, loading, limits } = useAuth()
  const [kit, setKit] = useState<BonusKitConfig | null>(null)
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'

  useEffect(() => {
    apiBonusKit().then(setKit).catch(() => setKit(null))
  }, [])

  if (!loading && !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent('/kit-oab')}`} replace />
  }

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
            Materiais liberados após confirmação do pagamento Pro ou Reta Final.{' '}
            <Link to="/planos" className="font-semibold text-brand-700 underline">
              Ver oferta
            </Link>
          </div>
        )}

        {kit?.whatsappGroupUrl && isPro && (
          <a
            href={kit.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Entrar no grupo Dicas OAB (WhatsApp)
          </a>
        )}

        {isPro && !kit?.whatsappGroupUrl && (
          <p className="mt-6 text-sm text-muted">
            Link do WhatsApp em breve. Enquanto isso:{' '}
            <a href="mailto:suporte@simulaordem.com.br" className="text-brand-600 hover:underline">
              suporte@simulaordem.com.br
            </a>
          </p>
        )}

        <ul className="mt-8 space-y-4">
          {(kit?.pdfs ?? []).map((pdf) => (
            <li key={pdf.id} className="card rounded-2xl p-5">
              <h2 className="font-semibold text-ink">{pdf.title}</h2>
              <p className="mt-1 text-sm text-muted">{pdf.description}</p>
              {isPro ? (
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
                >
                  Abrir guia · Salvar como PDF →
                </a>
              ) : (
                <p className="mt-4 text-xs text-muted-light">Disponível no plano Pro</p>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
