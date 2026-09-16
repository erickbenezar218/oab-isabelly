import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react'

export function useInView(threshold = 0.12, rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}

export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
  direction?: 'up' | 'left' | 'right' | 'scale'
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  direction = 'up',
}: RevealProps) {
  const { ref, inView } = useInView()
  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={`landing-reveal landing-reveal-${direction} ${inView ? 'landing-reveal-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

export function Float({
  children,
  className = '',
  speed = 'normal',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  speed?: 'normal' | 'slow' | 'gentle'
  delay?: number
}) {
  return (
    <div
      className={`landing-float landing-float-${speed} ${className}`}
      style={{ '--float-delay': `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  )
}

export function HeroBackdrop() {
  return (
    <div className="landing-backdrop pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-mesh" />
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
      <div className="landing-grid" />
    </div>
  )
}

export function AnimatedBars({
  items,
  inView,
}: {
  items: { nome: string; pct: number }[]
  inView: boolean
}) {
  return (
    <div className="space-y-4">
      {items.map((m, i) => (
        <div key={m.nome}>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-medium text-ink">{m.nome}</span>
            <span className={m.pct >= 60 ? 'font-semibold text-green-600' : 'font-semibold text-yellow-600'}>
              {m.pct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-700">
            <div
              className={`h-full rounded-full ${m.pct >= 60 ? 'bg-brand-500' : 'bg-yellow-500'} ${inView ? 'landing-bar-animate' : ''}`}
              style={
                {
                  width: `${m.pct}%`,
                  '--bar-delay': `${i * 120}ms`,
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function useTickingTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
