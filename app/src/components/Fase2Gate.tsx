import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconScale } from './icons'
import SectionCard from './ui/SectionCard'
import { useApp } from '../context/AppContext'

/** Bloqueia a 2ª fase até o membro confirmar aprovação na 1ª fase oficial da OAB. */
export default function Fase2Gate({ children }: { children: React.ReactNode }) {
  const { progress, updateProfile } = useApp()
  const unlocked = progress.profile?.fase1Aprovada === true
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (unlocked) return <>{children}</>

  const unlock = async () => {
    if (!confirmed) {
      setErr('Marque a confirmação abaixo.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await updateProfile({ fase1Aprovada: true })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-6">
      <SectionCard className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-700 text-muted">
          <IconScale size={28} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">2ª fase bloqueada</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          O treino de peças é para quem já <strong className="text-ink">passou na 1ª fase oficial</strong> do Exame da OAB
          (prova objetiva). Enquanto isso, foque em flashcards e simulados da 1ª fase.
        </p>
        <p className="mt-3 text-xs text-muted">
          Área escolhida para quando passar:{' '}
          <strong className="text-ink">{progress.profile?.area2fase ?? 'Trabalhista'}</strong> — ajuste em Conta → Perfil.
        </p>

        {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-muted">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600"
          />
          <span>
            Confirmo que fui <strong className="text-ink">aprovado(a) na 1ª fase oficial</strong> da OAB (resultado publicado
            pela FGV/OAB).
          </span>
        </label>

        <button
          type="button"
          onClick={() => void unlock()}
          disabled={busy || !confirmed}
          className="btn-primary mt-4 w-full py-3 text-sm disabled:opacity-50"
        >
          {busy ? 'Salvando…' : 'Desbloquear 2ª fase'}
        </button>

        <Link to="/app/simulado" className="mt-4 block text-sm font-medium text-brand-600 hover:underline">
          Voltar aos simulados da 1ª fase
        </Link>
      </SectionCard>
    </div>
  )
}
