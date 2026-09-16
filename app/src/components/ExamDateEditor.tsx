import { useState } from 'react'
import { defaultExamDateString, formatExamDatePt } from '../lib/examDate'
import { useApp } from '../context/AppContext'
import SectionCard from './ui/SectionCard'

export default function ExamDateEditor({ compact }: { compact?: boolean }) {
  const { progress, updateProfile } = useApp()
  const current = progress.profile?.examDate ?? defaultExamDateString()
  const [value, setValue] = useState(current)
  const minDate = new Date().toISOString().slice(0, 10)

  const save = () => {
    if (value) updateProfile({ examDate: value })
  }

  if (compact) {
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-medium text-amber-900">Atualize a data da sua próxima prova:</p>
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={value}
            min={minDate}
            onChange={(e) => setValue(e.target.value)}
            className="input-field flex-1 py-2 text-sm"
          />
          <button type="button" onClick={save} className="btn-primary shrink-0 px-4 py-2 text-sm">
            Salvar
          </button>
        </div>
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
        <input
          type="date"
          value={value}
          min={minDate}
          onChange={(e) => setValue(e.target.value)}
          className="input-field"
        />
      </label>
      <button type="button" onClick={save} className="btn-primary mt-3 w-full py-2.5 text-sm">
        Salvar data
      </button>
    </SectionCard>
  )
}
