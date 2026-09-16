import { Link } from 'react-router-dom'
import { IconStar, type IconProps } from './icons'
import SectionCard from './ui/SectionCard'
import type { ComponentType } from 'react'

export default function ProGate({
  title,
  description,
  Icon = IconStar,
}: {
  title: string
  description: string
  Icon?: ComponentType<IconProps>
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <SectionCard className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon size={28} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <Link
          to="/planos"
          className="mt-6 inline-block w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Assinar plano Pro — R$ 24,90/mês
        </Link>
        <p className="mt-4 text-xs text-muted-light">Simulados ilimitados · Cronograma · Tutor IA · Histórico completo</p>
      </SectionCard>
    </div>
  )
}
