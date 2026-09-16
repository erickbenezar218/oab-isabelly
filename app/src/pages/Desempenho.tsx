import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { IconChart, IconClose, IconPencil } from '../components/icons'
import PageHeader from '../components/ui/PageHeader'
import SectionCard from '../components/ui/SectionCard'
import { useApp } from '../context/AppContext'

const CORES = ['#3C8F92', '#2A606B', '#1C3F3A', '#5EEAD4', '#0F766E', '#134E4A']

export default function Desempenho() {
  const { progress, questoes, loading, addCustomCard, removeCustomCard } = useApp()
  const [aba, setAba] = useState<'grafico' | 'custom'>('grafico')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [materiaCustom, setMateriaCustom] = useState('')

  const materias = useMemo(() => [...new Set(questoes.map((q) => q.materia))].sort(), [questoes])

  const statsPorMateria = useMemo(() => {
    const map = new Map<string, { acertos: number; total: number }>()
    progress.respostas.forEach((r) => {
      if (!r.materia) return
      const cur = map.get(r.materia) ?? { acertos: 0, total: 0 }
      cur.total++
      if (r.correta) cur.acertos++
      map.set(r.materia, cur)
    })
    return [...map.entries()]
      .map(([materia, { acertos, total }]) => ({
        materia: materia.length > 18 ? materia.slice(0, 16) + '…' : materia,
        materiaFull: materia,
        pct: total > 0 ? Math.round((acertos / total) * 100) : 0,
        acertos,
        total,
      }))
      .sort((a, b) => b.total - a.total)
  }, [progress.respostas])

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !conteudo.trim()) return
    addCustomCard({
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      materia: materiaCustom || undefined,
      criadoEm: Date.now(),
    })
    setTitulo('')
    setConteudo('')
    setMateriaCustom('')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Desempenho" subtitle="Acompanhe seu acerto por matéria e salve anotações." />
      <div className="flex gap-2">
        {(['grafico', 'custom'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setAba(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ${
              aba === t ? 'bg-brand-600 text-white' : 'bg-surface-700 text-muted'
            }`}
          >
            {t === 'grafico' ? (
              <>
                <IconChart size={16} />
                Por matéria
              </>
            ) : (
              <>
                <IconPencil size={16} />
                Anotações
              </>
            )}
          </button>
        ))}
      </div>

      {aba === 'grafico' && (
        <>
          {statsPorMateria.length === 0 ? (
            <p className="py-12 text-center text-muted">
              Responda questões nos flashcards ou simulados para ver seu desempenho por matéria aqui.
            </p>
          ) : (
            <>
              <div className="card h-72 rounded-2xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsPorMateria} layout="vertical" margin={{ left: 4, right: 8 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis type="category" dataKey="materia" width={100} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }}
                      formatter={(value, _, item) => [
                        `${value}% (${item.payload.acertos}/${item.payload.total})`,
                        item.payload.materiaFull,
                      ]}
                    />
                    <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                      {statsPorMateria.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {statsPorMateria.map((s) => (
                  <div key={s.materiaFull} className="card rounded-xl px-4 py-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink">{s.materiaFull}</span>
                      <span className={s.pct >= 50 ? 'text-green-600' : 'text-yellow-600'}>{s.pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-700">
                      <div className="h-full bg-brand-500" style={{ width: `${s.pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-light">
                      {s.acertos} acertos em {s.total} questões
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {progress.simulados.length > 0 && (
            <SectionCard title="Histórico de simulados" subtitle="Revise erros na aba Simulado">
              <div className="mt-3 space-y-2">
                {progress.simulados.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex justify-between rounded-lg bg-surface-700 px-3 py-2 text-sm">
                    <span className="text-ink">{s.exame}</span>
                    <span className={s.acertos >= 40 ? 'text-green-600' : 'text-yellow-600'}>
                      {s.acertos}/{s.total}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {aba === 'custom' && (
        <>
          <form onSubmit={handleAddCard} className="card space-y-3 rounded-2xl p-4">
            <h3 className="font-semibold text-ink">Cadastrar Card Customizado</h3>
            <p className="text-xs text-muted">Anotações rápidas salvas na sua conta</p>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do card"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-light"
            />
            <select
              value={materiaCustom}
              onChange={(e) => setMateriaCustom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none"
            >
              <option value="">Matéria (opcional)</option>
              {materias.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Conteúdo / anotação..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-light"
            />
            <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white">
              Salvar Card
            </button>
          </form>

          <div className="space-y-2">
            {progress.customCards.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Nenhum card customizado ainda.</p>
            ) : (
              progress.customCards.map((card) => (
                <div key={card.id} className="card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{card.titulo}</p>
                      {card.materia && <p className="text-xs text-brand-500">{card.materia}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomCard(card.id)}
                      className="rounded-lg p-1 text-red-400/70 hover:bg-red-50 hover:text-red-500"
                      title="Remover"
                    >
                      <IconClose size={16} />
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{card.conteudo}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
