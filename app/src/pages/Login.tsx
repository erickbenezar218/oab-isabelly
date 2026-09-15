import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export default function Login() {
  const { user, loading, login, register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const googleRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleRef.current) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (res: { credential: string }) => {
          try {
            setBusy(true)
            await googleLogin(res.credential)
            navigate('/')
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro Google')
          } finally {
            setBusy(false)
          }
        },
      })
      window.google?.accounts.id.renderButton(googleRef.current!, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        locale: 'pt-BR',
      })
    }
    document.body.appendChild(script)
    return () => script.remove()
  }, [googleLogin, navigate])

  if (!loading && user) return <Navigate to="/" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, name)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-900 px-4 py-8">
      <img src="/logo.svg" alt="SimulaOrdem" className="mb-6 h-16 w-16" />
      <h1 className="text-2xl font-bold text-white">SimulaOrdem</h1>
      <p className="mt-1 text-center text-sm text-purple-300/70">Simulados reais para a 1ª fase da OAB</p>

      <form onSubmit={submit} className="mt-8 w-full max-w-sm space-y-3 rounded-2xl bg-surface-800 p-5">
        <div className="flex gap-2">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === m ? 'bg-brand-600 text-white' : 'bg-surface-700 text-purple-200'}`}
            >
              {m === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            className="w-full rounded-xl bg-surface-700 px-3 py-3 text-sm text-white outline-none"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          required
          className="w-full rounded-xl bg-surface-700 px-3 py-3 text-sm text-white outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha (mín. 6 caracteres)"
          required
          minLength={6}
          className="w-full rounded-xl bg-surface-700 px-3 py-3 text-sm text-white outline-none"
        />

        {error && <p className="text-center text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        {GOOGLE_CLIENT_ID && (
          <>
            <p className="text-center text-xs text-purple-400/50">ou</p>
            <div ref={googleRef} className="flex justify-center" />
          </>
        )}
      </form>

      <p className="mt-6 max-w-sm text-center text-[11px] text-purple-400/50">
        Ao continuar, você concorda com os{' '}
        <Link to="/termos" className="text-brand-300 underline">
          Termos de Uso
        </Link>{' '}
        e a{' '}
        <Link to="/privacidade" className="text-brand-300 underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
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
