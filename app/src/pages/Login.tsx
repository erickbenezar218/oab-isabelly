import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import GoogleSignInButton, { isGoogleSignInEnabled } from '../components/GoogleSignInButton'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-light focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20'

export default function Login() {
  const { user, loading, login, verifyOtp, register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/app'
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpChallengeId, setOtpChallengeId] = useState('')
  const [otpEmailMasked, setOtpEmailMasked] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('simulaordem-remember-email')
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  if (!loading && user) return <Navigate to={redirectTo.startsWith('/') ? redirectTo : '/app'} replace />

  const handleGoogleSuccess = async (credential: string) => {
    setBusy(true)
    setError('')
    try {
      await googleLogin(credential)
      navigate(redirectTo.startsWith('/') ? redirectTo : '/app')
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (remember) localStorage.setItem('simulaordem-remember-email', email)
      else localStorage.removeItem('simulaordem-remember-email')

      if (mode === 'login') {
        const result = await login(email, password)
        if ('requiresOtp' in result && result.requiresOtp) {
          setOtpChallengeId(result.challengeId)
          setOtpEmailMasked(result.email)
          setOtpCode('')
          setStep('otp')
          setInfo(`Enviamos um código de 6 dígitos para ${result.email}`)
          return
        }
      } else {
        await register(email, password, name)
        setInfo('Conta criada! Enviamos um e-mail com seus dados de acesso.')
      }
      navigate(redirectTo.startsWith('/') ? redirectTo : '/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setBusy(false)
    }
  }

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await verifyOtp(otpChallengeId, otpCode)
      navigate(redirectTo.startsWith('/') ? redirectTo : '/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-900 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.1)] lg:min-h-[640px]">
        {/* Coluna esquerda — formulário */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10">
            <Link to="/">
              <img src="/logo.svg" alt="SimulaOrdem" className="h-9 w-auto" />
            </Link>

            <div className="my-8 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {step === 'otp' ? 'Verifique seu e-mail' : mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {step === 'otp'
                  ? 'Digite o código de 6 dígitos que enviamos para confirmar seu login.'
                  : mode === 'login'
                    ? 'Entre com e-mail e senha para acessar seus simulados e flashcards.'
                    : 'Cadastre-se grátis e comece a treinar para a OAB — 1ª e 2ª fase.'}
              </p>

              {step === 'otp' ? (
                <form onSubmit={submitOtp} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-ink">
                      Código de verificação
                    </label>
                    <input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                      className={`${inputClass} text-center text-lg tracking-[0.3em] font-semibold`}
                    />
                    {otpEmailMasked && (
                      <p className="mt-2 text-center text-xs text-muted">Enviado para {otpEmailMasked}</p>
                    )}
                  </div>

                  {info && <p className="rounded-xl bg-brand-50 px-3 py-2 text-center text-xs text-brand-800">{info}</p>}
                  {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</p>}

                  <button
                    type="submit"
                    disabled={busy || otpCode.length !== 6}
                    className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {busy ? 'Verificando...' : 'Confirmar código'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials')
                      setOtpCode('')
                      setError('')
                      setInfo('')
                    }}
                    className="w-full text-sm font-medium text-brand-600 hover:underline"
                  >
                    Voltar ao login
                  </button>
                </form>
              ) : (
              <form onSubmit={submit} className="mt-8 space-y-5">
                {mode === 'register' && (
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                      Nome
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light hover:text-brand-600"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                      />
                      Lembrar de mim
                    </label>
                    <a href="mailto:suporte@simulaordem.com.br" className="text-sm font-medium text-brand-600 hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                )}

                {info && <p className="rounded-xl bg-brand-50 px-3 py-2 text-center text-xs text-brand-800">{info}</p>}
                {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              </form>
              )}

              {step === 'credentials' && isGoogleSignInEnabled() && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-muted-light">Ou entre com</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <GoogleSignInButton
                    disabled={busy}
                    onSuccess={handleGoogleSuccess}
                    onError={setError}
                  />
                </>
              )}

              {step === 'credentials' && !isGoogleSignInEnabled() && (
                <p className="mt-6 text-center text-xs text-muted-light">
                  Login com Google disponível quando <code className="text-brand-600">VITE_GOOGLE_CLIENT_ID</code> estiver configurado.
                </p>
              )}

              {step === 'credentials' && (
              <p className="mt-8 text-center text-sm text-muted">
                {mode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <button type="button" onClick={() => { setMode('register'); setError('') }} className="font-semibold text-brand-600 hover:underline">
                      Cadastre-se grátis
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{' '}
                    <button type="button" onClick={() => { setMode('login'); setError('') }} className="font-semibold text-brand-600 hover:underline">
                      Entrar
                    </button>
                  </>
                )}
              </p>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-muted-light sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} SimulaOrdem</span>
              <Link to="/privacidade" className="hover:text-brand-600">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna direita — painel marketing */}
        <div className="relative hidden w-1/2 flex-col overflow-hidden bg-brand-600 lg:flex">
          <PanelPattern />
          <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-12">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-200">OAB · 1ª e 2ª fase</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white xl:text-4xl">
                Preparação completa para a OAB
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-100">
                Simulados de 80 questões, flashcards, peças processuais, cronograma e revisão dos erros.
              </p>
            </div>

            <div className="relative mt-auto pt-10">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink">Desempenho por matéria</p>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">58%</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          { label: 'Constitucional', pct: 72 },
          { label: 'Civil', pct: 45 },
          { label: 'Ética', pct: 81 },
        ].map((m) => (
          <div key={m.label}>
            <div className="mb-1 flex justify-between text-[10px]">
              <span className="text-muted">{m.label}</span>
              <span className="font-medium text-brand-600">{m.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {['Flashcards', 'Simulado', 'Revisão'].map((t) => (
          <div key={t} className="rounded-lg bg-brand-50 py-2 text-center text-[10px] font-medium text-brand-700">
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

function PanelPattern() {
  return (
    <>
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-brand-500/30" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(-35deg, transparent, transparent 24px, #ffffff 24px, #ffffff 26px)`,
        }}
      />
    </>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M6.7 6.7C4.6 8.3 3 10.3 2 12c0 0 3.5 7 10 7 1.8 0 3.4-.5 4.8-1.2M14.1 14.1A2 2 0 0 1 9.9 9.9" />
    </svg>
  )
}

