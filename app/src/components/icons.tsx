import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function baseProps({ size = 20, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    ...rest,
  }
}

export function IconHome(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  )
}

export function IconZap(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}

export function IconChart(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 5-7" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export function IconScale(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7 2 13h6L5 7z" />
      <path d="M19 7l-3 6h6l-3-6z" />
    </svg>
  )
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-1.5-3-1.5-5.5 0 0 3 1 4.5 4 1.5-1 2.5-2.5 2.5-2.5 0 2.5 1.5 4.5 1.5 6.5a5.5 5.5 0 1 1-11 0z" />
    </svg>
  )
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconX(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function IconStar(props: IconProps) {
  return (
    <svg {...baseProps({ ...props, fill: props.fill ?? 'currentColor' })}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" stroke="none" />
    </svg>
  )
}

export function IconStarOutline(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  )
}

export function IconRocket(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.05-2.88a2.12 2.12 0 0 0-2.88-.05z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

export function IconClock(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function IconCircleCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function IconBookmark(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconSparkles(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  )
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  )
}

export function IconTrophy(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 4H4a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3M17 4h3a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3" />
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

export function IconShield(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export function IconBell(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

export function IconLogout(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

type QuestionStatus = 'acerto' | 'erro' | 'nao-respondida'

export function QuestionStatusIcon({ status, size = 14, className }: { status: QuestionStatus; size?: number; className?: string }) {
  if (status === 'acerto') return <IconCheck size={size} className={className ?? 'text-green-600'} />
  if (status === 'erro') return <IconX size={size} className={className ?? 'text-red-600'} />
  return <IconAlert size={size} className={className ?? 'text-yellow-600'} />
}

export function QuestionStatusLabel({ status }: { status: QuestionStatus }) {
  const label = status === 'acerto' ? 'Acertou' : status === 'erro' ? 'Errou' : 'Não respondida'
  return (
    <span className="inline-flex items-center gap-1.5">
      <QuestionStatusIcon status={status} size={14} />
      {label}
    </span>
  )
}
