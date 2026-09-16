import { useState } from 'react'
import { suggestedExamDateString } from '../lib/examDate'
import { useApp } from '../context/AppContext'

const AREAS_2F = ['Trabalhista', 'Cível', 'Penal', 'Administrativo', 'Tributário', 'Empresarial', 'Constitucional']

export default function OnboardingModal() {
  const { progress, updateProfile } = useApp()
  const [examDate, setExamDate] = useState(suggestedExamDateString())
  const [area2fase, setArea2fase] = useState('Trabalhista')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (progress.profile?.onboardingDone) return null

  const finish = async () => {
    if (!examDate) {
      setError('Escolha a data da sua prova.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await updateProfile({ examDate, area2fase, onboardingDone: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-w-md rounded-3xl p-6 shadow-xl md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Bem-vindo ao SimulaOrdem</p>
        <h2 className="mt-2 text-xl font-bold text-ink">Quando é a sua prova?</h2>
        <p className="mt-2 text-sm text-muted">
          Usamos essa data para contar os dias restantes e montar sua meta diária de estudo.
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Data da prova objetiva (1ª fase)</span>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="input-field"
            min={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Área da 2ª fase (quando passar na 1ª)</span>
          <select
            value={area2fase}
            onChange={(e) => setArea2fase(e.target.value)}
            className="input-field"
          >
            {AREAS_2F.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={() => void finish()}
          disabled={busy}
          className="btn-primary mt-6 w-full py-3 text-sm disabled:opacity-50"
        >
          {busy ? 'Salvando…' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
