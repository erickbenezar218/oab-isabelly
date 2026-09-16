import { useState } from 'react'
import { formatExamDatePt, suggestedExamDateString } from '../lib/examDate'
import { useApp } from '../context/AppContext'
import SectionCard from './ui/SectionCard'

export default function ExamDateEditor({ compact }: { compact?: boolean }) {
  const { progress, updateProfile } = useApp()
  const [value, setValue] = useState(progress.profile?.examDate ?? suggestedExamDateString())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const minDate = new Date().toISOString().slice(0, 10)

  const save = async () => {
    if (!value) {
      setError('Escolha uma data.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await updateProfile({ examDate: value })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setBusy(false)
    }
  }

  if (compact) {
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-medium text-amber-900">Escolha a data da sua próxima prova:</p>
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={value}
            min={minDate}
            onChange={(e) => setValue(e.target.value)}
            className="input-field flex-1 py-2 text-sm"
          />
          <button type="button" onClick={() => void save()} disabled={busy} className="btn-primary shrink-0 px-4 py-2 text-sm disabled:opacity-50">
            Salvar
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <SectionCard title="Data da prova" subtitle="Usamos isso para contar os dias e montar sua meta diária">
      <p className="text-sm text-muted">
        Prova cadastrada: <strong className="text-ink">{formatExamDatePt(progress.profile?.examDate)}</strong>
      </p>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Nova data</span>
        <input type="date" value={value} min={minDate} onChange={(e) => setValue(e.target.value)} className="input-field" />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="button" onClick={() => void save()} disabled={busy} className="btn-primary mt-3 w-full py-2.5 text-sm disabled:opacity-50">
        {busy ? 'Salvando…' : 'Salvar data'}
      </button>
    </SectionCard>
  )
}
