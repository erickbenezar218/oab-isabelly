import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiBonusGuideHtml } from '../lib/api'

export default function KitGuia() {
  const { guideId } = useParams<{ guideId: string }>()
  const { token, user, loading, limits } = useAuth()
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState('')
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'

  useEffect(() => {
    if (!token || !guideId || !isPro) return
    setError('')
    apiBonusGuideHtml(token, guideId)
      .then(setHtml)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível abrir o guia.'))
  }, [token, guideId, isPro])

  if (!loading && !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(`/kit-oab/guia/${guideId ?? ''}`)}`} replace />
  }

  if (!loading && user && !isPro) {
    return <Navigate to="/planos" replace />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-900">
      <header className="no-print flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link to="/kit-oab" className="text-sm font-medium text-brand-600 hover:underline">
          ← Kit Aprovador
        </Link>
        <button
          type="button"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          onClick={() => window.print()}
        >
          Salvar como PDF
        </button>
      </header>
      {error && (
        <p className="px-4 py-6 text-center text-sm text-red-600">{error}</p>
      )}
      {!html && !error && <p className="px-4 py-6 text-center text-sm text-muted">Carregando guia…</p>}
      {html && (
        <iframe
          title="Kit SimulaOrdem"
          className="min-h-[calc(100dvh-56px)] w-full flex-1 border-0 bg-white"
          srcDoc={html}
          sandbox="allow-same-origin allow-popups"
        />
      )}
    </div>
  )
}
