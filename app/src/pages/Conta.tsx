import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import SectionCard from '../components/ui/SectionCard'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { suggestedExamDateString } from '../lib/examDate'
import {
  apiBillingCancel,
  apiBillingPayments,
  apiBillingStatus,
  apiChangePassword,
  apiDeleteAccount,
  apiGetAccount,
  apiSetPassword,
  type BillingPaymentRow,
  type BillingStatus,
} from '../lib/api'
import { syncStudyReminderNotification } from '../lib/nativeNotifications'
import { isNativeApp } from '../lib/platform'
import { appVersionLabel } from '../lib/version'
import type { AccountInfo } from '../types'

const AREAS_2F = ['Trabalhista', 'Cível', 'Penal', 'Administrativo', 'Tributário', 'Empresarial', 'Constitucional']
const TABS = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'plano', label: 'Plano' },
  { id: 'estudo', label: 'Estudo' },
  { id: 'suporte', label: 'Suporte' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Conta() {
  const { user, token, limits, refreshUser, logout } = useAuth()
  const { progress, updateProfile } = useApp()
  const [tab, setTab] = useState<TabId>('perfil')
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loadingAccount, setLoadingAccount] = useState(true)

  const [name, setName] = useState(user?.name ?? '')
  const [examDate, setExamDate] = useState(progress.profile?.examDate ?? suggestedExamDateString())
  const [area2fase, setArea2fase] = useState(progress.profile?.area2fase ?? 'Trabalhista')
  const [dailyGoal, setDailyGoal] = useState(String(progress.profile?.dailyGoalOverride ?? ''))
  const [email2fa, setEmail2fa] = useState(progress.profile?.email2faEnabled ?? true)
  const [reminder, setReminder] = useState(progress.profile?.studyReminderEnabled ?? true)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [payments, setPayments] = useState<BillingPaymentRow[]>([])
  const [loadingBilling, setLoadingBilling] = useState(false)

  const [deletePw, setDeletePw] = useState('')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!token) return
    apiGetAccount(token)
      .then(({ account: acc, user: u }) => {
        setAccount(acc)
        setName(u.name)
        setEmail2fa(acc.email2faEnabled)
        setReminder(acc.studyReminderEnabled)
        setDailyGoal(acc.dailyGoalOverride != null ? String(acc.dailyGoalOverride) : '')
      })
      .catch(() => {})
      .finally(() => setLoadingAccount(false))
  }, [token])

  useEffect(() => {
    setExamDate(progress.profile?.examDate ?? suggestedExamDateString())
    setArea2fase(progress.profile?.area2fase ?? 'Trabalhista')
  }, [progress.profile?.examDate, progress.profile?.area2fase])

  useEffect(() => {
    if (!token || tab !== 'plano') return
    setLoadingBilling(true)
    Promise.all([apiBillingStatus(token), apiBillingPayments(token)])
      .then(([status, hist]) => {
        setBillingStatus(status)
        setPayments(hist.payments)
      })
      .catch(() => {})
      .finally(() => setLoadingBilling(false))
  }, [token, tab, user?.plan])

  const flash = (success: string) => {
    setMsg(success)
    setErr('')
    setTimeout(() => setMsg(''), 4000)
  }

  const saveProfile = async () => {
    setBusy(true)
    setErr('')
    try {
      await updateProfile({ name, examDate, area2fase })
      await refreshUser()
      flash('Perfil salvo.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }

  const saveStudyPrefs = async () => {
    setBusy(true)
    setErr('')
    try {
      const override = dailyGoal.trim() ? Number(dailyGoal) : null
      await updateProfile({
        dailyGoalOverride: override,
        studyReminderEnabled: reminder,
      })
      flash('Preferências de estudo salvas.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }

  const save2fa = async (enabled: boolean) => {
    setEmail2fa(enabled)
    setErr('')
    try {
      await updateProfile({ email2faEnabled: enabled })
      setAccount((a) => (a ? { ...a, email2faEnabled: enabled } : a))
      flash(enabled ? 'Verificação por e-mail ativada.' : 'Verificação por e-mail desativada.')
    } catch (e) {
      setEmail2fa(!enabled)
      setErr(e instanceof Error ? e.message : 'Erro ao salvar.')
    }
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (newPw !== confirmPw) {
      setErr('As senhas não coincidem.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      if (account?.hasPassword) {
        const data = await apiChangePassword(token, currentPw, newPw)
        flash(data.message)
      } else {
        const data = await apiSetPassword(token, newPw)
        flash(data.message)
        setAccount((a) => (a ? { ...a, hasPassword: true } : a))
      }
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro na senha.')
    } finally {
      setBusy(false)
    }
  }

  const redoTour = async () => {
    await updateProfile({ welcomeTourDone: false })
    flash('Tour reativado — volte ao Início para ver.')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simulaordem-progresso-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('Backup exportado.')
  }

  const saveReminder = async (enabled: boolean) => {
    setReminder(enabled)
    setErr('')
    try {
      await updateProfile({ studyReminderEnabled: enabled })
      if (isNativeApp()) {
        await syncStudyReminderNotification(enabled)
        flash(
          enabled
            ? 'Lembrete ativado: e-mail diário + notificação no iPhone às 8h.'
            : 'Lembretes desativados.',
        )
      } else {
        flash(
          enabled
            ? 'Lembrete diário por e-mail ativado (por volta das 8h, horário de Brasília).'
            : 'Lembrete por e-mail desativado.',
        )
      }
    } catch (e) {
      setReminder(!enabled)
      setErr(e instanceof Error ? e.message : 'Erro ao salvar lembrete.')
    }
  }

  const cancelSubscription = async () => {
    if (!token) return
    if (!window.confirm('Cancelar renovação automática? Você mantém o Pro até o fim do período já pago.')) return
    setBusy(true)
    setErr('')
    try {
      const data = await apiBillingCancel(token)
      flash(data.message)
      const status = await apiBillingStatus(token)
      setBillingStatus(status)
      await refreshUser()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao cancelar.')
    } finally {
      setBusy(false)
    }
  }

  const submitDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!deleteConfirm) {
      setErr('Marque a confirmação para excluir a conta.')
      return
    }
    if (!window.confirm('Excluir conta permanentemente? Esta ação não pode ser desfeita.')) return
    setBusy(true)
    setErr('')
    try {
      await apiDeleteAccount(token, {
        password: account?.hasPassword ? deletePw : undefined,
        confirmEmail: !account?.hasPassword ? deleteEmail : undefined,
      })
      logout()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao excluir conta.')
    } finally {
      setBusy(false)
    }
  }

  const formatPaymentStatus = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: 'Confirmado',
      RECEIVED: 'Recebido',
      PENDING: 'Pendente',
      OVERDUE: 'Vencido',
      REFUNDED: 'Estornado',
    }
    return map[status] ?? status
  }

  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'
  const planExpires = user?.planExpiresAt
    ? new Date(user.planExpiresAt).toLocaleDateString('pt-BR')
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Conta e configurações" subtitle="Perfil, segurança, plano e preferências de estudo." />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t.id ? 'bg-brand-600 text-white' : 'bg-surface-700 text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(msg || err) && (
        <p className={`rounded-xl px-4 py-3 text-sm ${err ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>
          {err || msg}
        </p>
      )}

      {tab === 'perfil' && (
        <SectionCard title="Seu perfil">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Nome</span>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">E-mail</span>
              <input className="input-field bg-surface-700 text-muted" value={user?.email ?? ''} readOnly />
              <p className="mt-1 text-xs text-muted">Para trocar o e-mail, contate suporte@simulaordem.com.br</p>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Data da prova objetiva</span>
              <input
                type="date"
                className="input-field"
                value={examDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Área da 2ª fase</span>
              <select className="input-field" value={area2fase} onChange={(e) => setArea2fase(e.target.value)}>
                {AREAS_2F.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => void saveProfile()} disabled={busy} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
              Salvar perfil
            </button>
          </div>
        </SectionCard>
      )}

      {tab === 'seguranca' && (
        <>
          <SectionCard title="Verificação em duas etapas">
            {loadingAccount ? (
              <p className="text-sm text-muted">Carregando…</p>
            ) : (
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">Código por e-mail no login</p>
                  <p className="text-xs text-muted">Envia um código de 6 dígitos ao entrar com senha.</p>
                </div>
                <input
                  type="checkbox"
                  checked={email2fa}
                  onChange={(e) => void save2fa(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600"
                />
              </label>
            )}
          </SectionCard>

          <SectionCard title={account?.hasPassword ? 'Alterar senha' : 'Definir senha'}>
            {account?.hasGoogle && !account.hasPassword && (
              <p className="mb-3 text-xs text-muted">Conta vinculada ao Google. Defina uma senha para também entrar com e-mail.</p>
            )}
            <form onSubmit={submitPassword} className="space-y-3">
              {account?.hasPassword && (
                <input
                  type="password"
                  placeholder="Senha atual"
                  className="input-field"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                />
              )}
              <input
                type="password"
                placeholder="Nova senha (mín. 6)"
                className="input-field"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                className="input-field"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
              />
              <button type="submit" disabled={busy} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
                {account?.hasPassword ? 'Alterar senha' : 'Definir senha'}
              </button>
            </form>
            <Link to="/redefinir-senha" className="mt-3 block text-center text-xs font-medium text-brand-600 hover:underline">
              Esqueci a senha — enviar link por e-mail
            </Link>
          </SectionCard>

          <SectionCard title="Excluir conta">
            <p className="text-sm text-muted">
              Remove permanentemente sua conta, progresso e assinatura. Conforme LGPD — art. 18.
            </p>
            <form onSubmit={submitDeleteAccount} className="mt-4 space-y-3">
              {account?.hasPassword ? (
                <input
                  type="password"
                  placeholder="Sua senha"
                  className="input-field"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              ) : (
                <input
                  type="email"
                  placeholder="Confirme seu e-mail"
                  className="input-field"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              )}
              <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600"
                />
                <span>Entendo que todos os meus dados serão apagados e não poderei recuperar a conta.</span>
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                Excluir minha conta
              </button>
            </form>
          </SectionCard>
        </>
      )}

      {tab === 'plano' && (
        <>
          <SectionCard title="Seu plano">
            <div className="rounded-xl bg-surface-700 px-4 py-3">
              <p className="text-lg font-bold text-ink">{isPro ? 'Pro' : 'Grátis'}</p>
              {planExpires && <p className="text-xs text-muted">Válido até {planExpires}</p>}
              {billingStatus?.subscriptionCancelled && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Renovação cancelada — acesso Pro até {planExpires ?? 'o vencimento'}
                </p>
              )}
              {billingStatus?.sandbox && (
                <p className="mt-1 text-xs text-muted">Ambiente Asaas: sandbox (testes)</p>
              )}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>{isPro ? 'Simulados ilimitados' : '1 simulado completo por mês'}</li>
              <li>{isPro ? 'Cronograma e meta diária' : 'Cronograma no plano Pro'}</li>
              <li>{isPro ? 'Chat ilimitado com Professor IA' : '20 explicações IA/dia'}</li>
            </ul>
            <Link to="/planos" className="btn-primary mt-4 block py-2.5 text-center text-sm">
              {isPro ? 'Ver planos' : 'Fazer upgrade para Pro'}
            </Link>
            {billingStatus?.canCancel && (
              <button
                type="button"
                onClick={() => void cancelSubscription()}
                disabled={busy}
                className="btn-secondary mt-3 w-full py-2.5 text-sm text-red-700 disabled:opacity-50"
              >
                Cancelar renovação automática
              </button>
            )}
          </SectionCard>

          <SectionCard title="Histórico de pagamentos">
            {loadingBilling ? (
              <p className="text-sm text-muted">Carregando…</p>
            ) : payments.length === 0 ? (
              <p className="text-sm text-muted">Nenhum pagamento registrado ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{p.description}</p>
                      <p className="text-xs text-muted">
                        {new Date(p.date).toLocaleDateString('pt-BR')} · {formatPaymentStatus(p.status)}
                      </p>
                    </div>
                    {p.value != null && (
                      <span className="font-semibold tabular-nums text-ink">
                        {p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}

      {tab === 'estudo' && (
        <>
          <SectionCard title="Meta diária personalizada">
            <p className="mb-3 text-xs text-muted">Deixe vazio para usar a meta automática baseada na data da prova.</p>
            <input
              type="number"
              min={1}
              max={500}
              placeholder="Ex: 30 questões/dia"
              className="input-field"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
            />
            <button type="button" onClick={() => void saveStudyPrefs()} disabled={busy} className="btn-primary mt-3 w-full py-2.5 text-sm disabled:opacity-50">
              Salvar meta
            </button>
          </SectionCard>

          <SectionCard title={isNativeApp() ? 'Lembretes de estudo' : 'Lembretes por e-mail'}>
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Lembrete diário de estudo</p>
                <p className="mt-1 text-xs text-muted">
                  {isNativeApp() ? (
                    <>
                      E-mail às <strong>8h</strong> para {user?.email} + <strong>notificação no iPhone</strong> no
                      mesmo horário.
                    </>
                  ) : (
                    <>
                      Enviado todo dia por volta das <strong>8h</strong> (Brasília) para{' '}
                      <span className="font-medium text-ink">{user?.email}</span>.
                    </>
                  )}
                </p>
              </div>
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => void saveReminder(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-brand-600"
              />
            </label>
          </SectionCard>

          <SectionCard title="Tour e backup">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => void redoTour()} className="btn-secondary flex-1 py-2.5 text-sm">
                Ver tour de novo
              </button>
              <button type="button" onClick={exportData} className="btn-secondary flex-1 py-2.5 text-sm">
                Exportar progresso (JSON)
              </button>
            </div>
          </SectionCard>
        </>
      )}

      {tab === 'suporte' && (
        <SectionCard title="Ajuda">
          <div className="space-y-3 text-sm text-muted">
            <p>
              <strong className="text-ink">Dúvidas?</strong> Escreva para{' '}
              <a href="mailto:suporte@simulaordem.com.br" className="font-medium text-brand-600 hover:underline">
                suporte@simulaordem.com.br
              </a>
            </p>
            <details className="rounded-xl border border-slate-200 px-4 py-3">
              <summary className="cursor-pointer font-medium text-ink">Perguntas frequentes</summary>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Flashcards corrigem sozinhos ao tocar na alternativa.</li>
                <li>Simulado grátis: 1 completo por mês; Express é ilimitado.</li>
                <li>Professor IA explica erros — 20/dia no grátis.</li>
                <li>Data da prova ajusta cronograma e contagem regressiva.</li>
              </ul>
            </details>
            <div className="flex gap-4 pt-2">
              <Link to="/termos" className="text-brand-600 hover:underline">
                Termos de uso
              </Link>
              <Link to="/privacidade" className="text-brand-600 hover:underline">
                Privacidade
              </Link>
            </div>
            <p className="pt-2 text-xs text-muted-light">{appVersionLabel()}</p>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
