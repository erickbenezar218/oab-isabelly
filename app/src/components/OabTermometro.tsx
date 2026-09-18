import { calcTermometroOab, termometroCor } from '../lib/termometroOab'
import { NOTA_APROVACAO, SIMULADO_TOTAL } from '../types'

type Props = {
  ultimoSimulado?: { acertos: number; total: number } | null
  totalRespondidas: number
  acertos: number
  compact?: boolean
  className?: string
}

export default function OabTermometro({ ultimoSimulado, totalRespondidas, acertos, compact, className = '' }: Props) {
  const t = calcTermometroOab({ ultimoSimulado, totalRespondidas, acertos })
  const fill = termometroCor(t.pct, t.passaria)

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex h-36 w-10 shrink-0 flex-col items-center justify-end sm:h-40 sm:w-11">
        <div className="absolute inset-x-0 bottom-0 top-2 rounded-full border-2 border-slate-200 bg-surface-700/60">
          <div
            className="absolute inset-x-0 bottom-0 rounded-full transition-all duration-700 ease-out"
            style={{ height: `${Math.max(t.fonte === 'sem_dados' ? 8 : t.pct, 6)}%`, backgroundColor: fill }}
          />
        </div>
        <div className="absolute -top-0.5 h-3 w-5 rounded-t-full bg-slate-300" aria-hidden />
        <span
          className="absolute left-1/2 -translate-x-1/2 text-[9px] font-bold tabular-nums text-muted"
          style={{ bottom: `${Math.min(t.pct, 92)}%` }}
        >
          {t.fonte === 'sem_dados' ? '—' : t.score}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Termômetro OAB</p>
        <p className={`font-bold text-ink ${compact ? 'text-lg' : 'text-xl'}`}>{t.label}</p>
        {!compact && (
          <p className="mt-1 text-sm text-muted">
            Meta de aprovação: <strong className="text-ink">{NOTA_APROVACAO}/{SIMULADO_TOTAL}</strong>
            {t.fonte !== 'sem_dados' && (
              <>
                {' '}
                · Projeção: <strong className="text-ink">{t.score}/{SIMULADO_TOTAL}</strong>
              </>
            )}
          </p>
        )}
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.detail}</p>
      </div>
    </div>
  )
}

/** Demo estático para a landing (sem login). */
export function OabTermometroDemo() {
  return (
    <OabTermometro
      ultimoSimulado={{ acertos: 34, total: 80 }}
      totalRespondidas={420}
      acertos={280}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    />
  )
}
