import { Link } from 'react-router-dom'

export default function UpgradeCard({ compact }: { compact?: boolean }) {
  return (
    <div className={`rounded-2xl bg-surface-700 ${compact ? 'p-4' : 'p-5'}`}>
      <p className="text-sm font-semibold text-ink">Upgrade para Pro</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Simulados ilimitados, cronograma e tutor IA completo.
      </p>
      <Link
        to="/planos"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
      >
        Ver planos
      </Link>
    </div>
  )
}
