import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CONSENT_EVENT,
  captureAttribution,
  getConsent,
  isPixelConfigured,
  setConsent,
  trackPageView,
  type ConsentState,
} from '../lib/metaPixel'

/**
 * Captura UTM/fbclid, dispara PageView a cada troca de rota (após consentimento)
 * e mostra o aviso de cookies (LGPD) enquanto o usuário não escolher.
 */
export default function MetaPixelTracker() {
  const location = useLocation()
  const [consent, setConsentState] = useState<ConsentState>(() => getConsent())

  useEffect(() => {
    captureAttribution(location.search)
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onChange = () => setConsentState(getConsent())
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!isPixelConfigured() || consent !== null) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 safe-bottom"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-12px_rgba(15,42,39,0.35)] md:flex-row md:items-center md:gap-5">
        <p className="flex-1 text-sm text-muted">
          Usamos cookies de marketing (Meta Pixel) para medir nossos anúncios. Eles só são ativados se você aceitar.{' '}
          <Link to="/privacidade" className="font-medium text-brand-600 underline-offset-2 hover:underline">
            Política de Privacidade
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConsent('denied')}
            className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-ink hover:border-brand-400 md:flex-none"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => setConsent('granted')}
            className="min-h-11 flex-1 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 md:flex-none"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
