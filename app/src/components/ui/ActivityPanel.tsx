import { Link } from 'react-router-dom'
import { formatTempo } from '../../hooks/useAppData'
import type { SimuladoResult } from '../../types'
import { IconChart, IconClipboard } from '../icons'
import SectionCard from './SectionCard'

function formatarData(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityPanel({
  name,
  email,
  simulados,
  pctAcerto,
}: {
  name: string
  email?: string
  simulados: SimuladoResult[]
  pctAcerto: number
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <aside className="space-y-4">
      <SectionCard>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {initials || 'SO'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{name}</p>
            {email && <p className="truncate text-xs text-muted">{email}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-surface-700 px-3 py-2 text-center">
            <p className="text-lg font-bold text-ink">{pctAcerto}%</p>
            <p className="text-[10px] text-muted">Acerto geral</p>
          </div>
          <div className="rounded-xl bg-surface-700 px-3 py-2 text-center">
            <p className="text-lg font-bold text-ink">{simulados.length}</p>
            <p className="text-[10px] text-muted">Simulados</p>
          </div>
        </div>
        <Link
          to="/app/desempenho"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          <IconChart size={14} />
          Ver desempenho
        </Link>
      </SectionCard>

      <SectionCard title="Atividade recente" subtitle="Últimos simulados">
        {simulados.length === 0 ? (
          <p className="text-sm text-muted">Nenhum simulado finalizado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {simulados.slice(0, 4).map((s) => (
              <li key={s.id} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <IconClipboard size={16} />
                </div>
                <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <p className="truncate text-sm font-medium text-ink">{s.exame}</p>
                  <p className="text-xs text-muted">
                    {s.acertos}/{s.total} acertos · {formatTempo(s.tempoUsadoSeg)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-light">{formatarData(s.finalizadoEm)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {simulados.length > 0 && (
          <Link to="/app/simulado" className="mt-3 block text-center text-xs font-semibold text-brand-600 hover:underline">
            Abrir simulados
          </Link>
        )}
      </SectionCard>
    </aside>
  )
}
