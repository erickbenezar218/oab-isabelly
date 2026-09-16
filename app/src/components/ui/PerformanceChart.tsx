import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RespostaRegistro } from '../../types'

const CORES = { atual: '#3C8F92', anterior: '#F59E0B' }

function diaKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function labelDia(key: string) {
  const [, m, d] = key.split('-')
  return `${d}/${m}`
}

export default function PerformanceChart({ respostas }: { respostas: RespostaRegistro[] }) {
  const data = useMemo(() => {
    const hoje = new Date()
    const dias: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoje)
      d.setDate(d.getDate() - i)
      dias.push(diaKey(d.getTime()))
    }

    const atual = new Map<string, { total: number; acertos: number }>()
    const anterior = new Map<string, { total: number; acertos: number }>()

    respostas.forEach((r) => {
      const key = diaKey(r.timestamp)
      const map = dias.includes(key) ? atual : null
      if (!map) {
        const d = new Date(r.timestamp)
        d.setDate(d.getDate() + 7)
        const prevKey = diaKey(d.getTime())
        if (dias.includes(prevKey)) {
          const cur = anterior.get(prevKey) ?? { total: 0, acertos: 0 }
          cur.total++
          if (r.correta) cur.acertos++
          anterior.set(prevKey, cur)
        }
        return
      }
      const cur = map.get(key) ?? { total: 0, acertos: 0 }
      cur.total++
      if (r.correta) cur.acertos++
      map.set(key, cur)
    })

    return dias.map((key) => {
      const a = atual.get(key)
      const p = anterior.get(key)
      return {
        dia: labelDia(key),
        atual: a && a.total > 0 ? Math.round((a.acertos / a.total) * 100) : null,
        anterior: p && p.total > 0 ? Math.round((p.acertos / p.total) * 100) : null,
      }
    })
  }, [respostas])

  const temDados = data.some((d) => d.atual != null || d.anterior != null)

  return (
    <div className="card rounded-2xl p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink md:text-lg">Desempenho</h2>
          <p className="text-xs text-muted">Percentual de acerto · últimos 7 dias</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: CORES.atual }} />
            Esta semana
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: CORES.anterior }} />
            Semana anterior
          </span>
        </div>
      </div>

      {!temDados ? (
        <p className="flex h-48 items-center justify-center text-sm text-muted">
          Responda questões para ver o gráfico aqui.
        </p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0F172A',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(value) => (value != null ? [`${value}%`, ''] : ['—', ''])}
              />
              <Line type="monotone" dataKey="atual" stroke={CORES.atual} strokeWidth={2.5} dot={false} connectNulls />
              <Line type="monotone" dataKey="anterior" stroke={CORES.anterior} strokeWidth={2} dot={false} connectNulls strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
