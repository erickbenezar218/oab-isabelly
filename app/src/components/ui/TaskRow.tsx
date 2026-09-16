import { Link } from 'react-router-dom'
import { IconArrowRight } from '../icons'
import StatusDot from './StatusDot'

export type TaskStatus = 'done' | 'progress' | 'hold'

export default function TaskRow({
  to,
  icon,
  title,
  status,
  statusLabel,
  meta,
  onClick,
}: {
  to?: string
  icon: React.ReactNode
  title: string
  status: TaskStatus
  statusLabel: string
  meta?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-700 text-brand-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusDot status={status} />
          <span className="text-xs text-muted">{statusLabel}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {meta && <span className="text-xs font-semibold text-muted">{meta}</span>}
        <IconArrowRight size={16} className="text-muted-light" />
      </div>
    </>
  )

  const className =
    'group flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3.5 text-left transition hover:border-slate-200 hover:shadow-sm active:scale-[0.99]'

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}
