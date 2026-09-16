import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { defaultExamDateString } from '../lib/examDate'

const AREAS_2F = ['Trabalhista', 'Cível', 'Penal', 'Administrativo', 'Tributário', 'Empresarial', 'Constitucional']

export default function OnboardingModal() {
  const { progress, updateProfile } = useApp()
  const [examDate, setExamDate] = useState(defaultExamDateString())
  const [area2fase, setArea2fase] = useState('Trabalhista')

  if (progress.profile?.onboardingDone) return null

  const finish = () => {
    updateProfile({ examDate, area2fase, onboardingDone: true })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-w-md rounded-3xl p-6 shadow-xl md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Bem-vindo ao SimulaOrdem</p>
        <h2 className="mt-2 text-xl font-bold text-ink">Configure sua preparação</h2>
        <p className="mt-2 text-sm text-muted">
          Leva 30 segundos — depois um tour rápido mostra cada módulo do app.
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Data da próxima prova objetiva</span>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="input-field"
            min={new Date().toISOString().slice(0, 10)}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Área da 2ª fase (depois que passar na 1ª)</span>
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

        <button
          type="button"
          onClick={finish}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white"
        >
          Começar a estudar
        </button>
      </div>
    </div>
  )
}
