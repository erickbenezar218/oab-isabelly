import { useEffect, useRef, useState } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

interface GoogleSignInButtonProps {
  disabled?: boolean
  onSuccess: (credential: string) => Promise<void>
  onError: (message: string) => void
}

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID?.trim())
}

export default function GoogleSignInButton({ disabled, onSuccess, onError }: GoogleSignInButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const callbacksRef = useRef({ onSuccess, onError })
  callbacksRef.current = { onSuccess, onError }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID?.trim() || !hostRef.current) return

    let cancelled = false

    const mount = () => {
      if (cancelled || !hostRef.current || !window.google?.accounts?.id) return

      hostRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (res: { credential: string }) => {
          try {
            await callbacksRef.current.onSuccess(res.credential)
          } catch (e) {
            callbacksRef.current.onError(e instanceof Error ? e.message : 'Erro ao entrar com Google')
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(hostRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        locale: 'pt-BR',
        width: 400,
      })
      setReady(true)
    }

    if (window.google?.accounts?.id) {
      mount()
      return () => {
        cancelled = true
      }
    }

    const existing = document.querySelector('script[data-google-gsi]')
    if (existing) {
      existing.addEventListener('load', mount)
      return () => {
        cancelled = true
        existing.removeEventListener('load', mount)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.dataset.googleGsi = '1'
    script.onload = mount
    script.onerror = () => onError('Não foi possível carregar o login do Google.')
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [onError])

  if (!GOOGLE_CLIENT_ID?.trim()) return null

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-ink"
        aria-hidden
      >
        <GoogleIcon />
        Google
      </div>
      <div
        ref={hostRef}
        className={`absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.01] ${disabled || !ready ? 'pointer-events-none' : ''}`}
        aria-label="Entrar com Google"
      />
      {!ready && (
        <button
          type="button"
          disabled
          className="absolute inset-0 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-ink opacity-50"
        >
          <GoogleIcon />
          Carregando Google...
        </button>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void
          renderButton: (el: HTMLElement, cfg: object) => void
        }
      }
    }
  }
}
