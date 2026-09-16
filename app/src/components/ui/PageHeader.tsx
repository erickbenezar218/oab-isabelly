import { IconCalendar } from '../icons'

export default function PageHeader({
  title,
  subtitle,
  date,
  action,
}: {
  title: string
  subtitle?: string
  date?: string
  action?: React.ReactNode
}) {
  const displayDate =
    date ??
    new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-xl text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-muted shadow-sm">
          <IconCalendar size={16} className="text-brand-500" />
          {displayDate}
        </div>
      </div>
    </header>
  )
}
