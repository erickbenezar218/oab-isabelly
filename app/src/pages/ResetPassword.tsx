import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiForgotPassword, apiResetPassword, apiValidateResetToken } from '../lib/api'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-light focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [validating, setValidating] = useState(Boolean(token))
  const [tokenValid, setTokenValid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token) {
      setValidating(false)
      return
    }
    setValidating(true)
    setError('')
    apiValidateResetToken(token)
      .then((data) => {
        setTokenValid(true)
        setMaskedEmail(data.email)
      })
      .catch((e) => {
        setTokenValid(false)
        setError(e instanceof Error ? e.message : 'Link inválido.')
      })
      .finally(() => setValidating(false))
  }, [token])

  const requestLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const data = await apiForgotPassword(email)
      setSuccess(data.message)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o e-mail.')
    } finally {
      setBusy(false)
    }
  }

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const data = await apiResetPassword(token, password)
      setSuccess(data.message)
      setPassword('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-900 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex items-center gap-2.5">
          <img src="/logo-icon.svg" alt="" className="h-10 w-10 rounded-xl" />
          <span className="text-lg font-bold text-ink">SimulaOrdem</span>
        </div>

        {validating ? (
          <div className="mt-8 flex justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : token && tokenValid ? (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">Nova senha</h1>
            <p className="mt-2 text-sm text-muted">
              Conta: <strong className="text-ink">{maskedEmail}</strong>
            </p>
            <form onSubmit={submitNewPassword} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Nova senha</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Confirmar senha</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </label>
              {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</p>}
              {success && (
                <p className="rounded-xl bg-green-50 px-3 py-2 text-center text-xs text-green-800">{success}</p>
              )}
              <button
                type="submit"
                disabled={busy || Boolean(success)}
                className="btn-primary w-full py-3 text-sm disabled:opacity-50"
              >
                {busy ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
            {success && (
              <Link to="/login" className="mt-4 block text-center text-sm font-semibold text-brand-600 hover:underline">
                Ir para o login
              </Link>
            )}
          </>
        ) : token && !tokenValid ? (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">Link expirado</h1>
            <p className="mt-2 text-sm text-muted">{error || 'Solicite um novo link abaixo.'}</p>
            <ForgotForm
              email={email}
              setEmail={setEmail}
              busy={busy}
              error={error}
              success={success}
              onSubmit={requestLink}
            />
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">Esqueceu a senha?</h1>
            <p className="mt-2 text-sm text-muted">
              Informe seu e-mail. Enviaremos um link para redefinir a senha (abre em nova aba).
            </p>
            <ForgotForm
              email={email}
              setEmail={setEmail}
              busy={busy}
              error={error}
              success={success}
              onSubmit={requestLink}
            />
          </>
        )}

        {!success && (
          <Link to="/login" className="mt-6 block text-center text-sm text-muted hover:text-brand-600">
            ← Voltar ao login
          </Link>
        )}
      </div>
    </div>
  )
}

function ForgotForm({
  email,
  setEmail,
  busy,
  error,
  success,
  onSubmit,
}: {
  email: string
  setEmail: (v: string) => void
  busy: boolean
  error: string
  success: string
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="voce@email.com"
          required
          autoComplete="email"
        />
      </label>
      {error && !success && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-center text-xs text-green-800">{success}</p>
      )}
      <button type="submit" disabled={busy} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
        {busy ? 'Enviando…' : 'Enviar link por e-mail'}
      </button>
    </form>
  )
}
