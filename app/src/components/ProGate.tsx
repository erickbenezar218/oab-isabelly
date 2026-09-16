import { Link } from 'react-router-dom'

export default function ProGate({
  title,
  description,
  emoji = '⭐',
}: {
  title: string
  description: string
  emoji?: string
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="card max-w-md rounded-2xl p-8">
        <span className="text-4xl">{emoji}</span>
        <h1 className="mt-4 text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <Link
          to="/planos"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Assinar plano Pro — R$ 24,90/mês
        </Link>
        <p className="mt-4 text-xs text-muted-light">Simulados ilimitados · Cronograma · Tutor IA · Histórico completo</p>
      </div>
    </div>
  )
}
