import type { ReactNode } from 'react'

export default function StatCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  icon,
}: {
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down' | 'neutral'
  icon: ReactNode
}) {
  const deltaClass =
    deltaTone === 'up' ? 'text-green-600' : deltaTone === 'down' ? 'text-red-500' : 'text-muted'

  return (
    <div className="card flex flex-col gap-3 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
      </div>
      {delta && <p className={`text-xs font-medium ${deltaClass}`}>{delta}</p>}
    </div>
  )
}
