import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import { shuffle } from '../hooks/useAppData'

interface CasoPeca {
  id: string
  area: string
  exame: string
  enunciado: string
  peca_correta: string
  alternativas: string[]
  explicacao: string
}

interface BancoPecas {
  meta: { total: number; areas: string[] }
  casos: CasoPeca[]
}

export default function Pecas() {
  const { progress, registrarPeca } = useApp()
  const [banco, setBanco] = useState<BancoPecas | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordem, setOrdem] = useState<CasoPeca[]>([])
  const [idx, setIdx] = useState(0)
  const [areaFiltro, setAreaFiltro] = useState('todas')
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [revelado, setRevelado] = useState(false)

  useEffect(() => {
    fetch('/pecas_oab.json')
      .then((r) => r.json())
      .then(setBanco)
      .finally(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    if (!banco) return []
    return areaFiltro === 'todas' ? banco.casos : banco.casos.filter((c) => c.area === areaFiltro)
  }, [banco, areaFiltro])

  useEffect(() => {
    setOrdem(shuffle(filtrados))
    setIdx(0)
    setSelecionada(null)
    setRevelado(false)
  }, [filtrados])

  const caso = ordem[idx]

  const stats = useMemo(() => {
    const pecas = progress.pecasRespostas ?? []
    const total = pecas.length
    const acertos = pecas.filter((p) => p.correta).length
    return { total, acertos, pct: total ? Math.round((acertos / total) * 100) : 0 }
  }, [progress.pecasRespostas])

  const confirmar = () => {
    if (!caso || !selecionada || revelado) return
    const correta = selecionada === caso.peca_correta
    setRevelado(true)
    registrarPeca({
      casoId: caso.id,
      selecionada,
      correta,
      timestamp: Date.now(),
    })
  }

  const proximo = useCallback(() => {
    setSelecionada(null)
    setRevelado(false)
    setIdx((i) => (ordem.length ? (i + 1) % ordem.length : 0))
  }, [ordem.length])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!banco || !caso) {
    return <p className="text-center text-muted">Nenhum caso disponível.</p>
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">2ª fase OAB</p>
        <h1 className="text-xl font-bold text-ink">Adivinhe a peça</h1>
        <p className="mt-1 text-sm text-muted">
          Leia o caso e escolha qual peça processual deve ser elaborada.
        </p>
      </section>

      <details className="card rounded-2xl p-4">
        <summary className="cursor-pointer text-sm font-semibold text-brand-700">Método dos 3 pilares (como acertar a peça)</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-muted">
          <li><strong>De que lado você está?</strong> Autor quer ingressar; réu quer se defender; recurso contra decisão.</li>
          <li><strong>Momento processual</strong> — o pulo do gato: último ato válido define a peça (citação → contestação; sentença → apelação).</li>
          <li><strong>Palavras-chave</strong> — reclamação, execução, mandado de segurança, habeas corpus, etc.</li>
        </ol>
      </details>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Casos" value={String(banco.meta.total)} />
        <Stat label="Seus acertos" value={`${stats.pct}%`} highlight={stats.pct >= 60} />
        <Stat label="Tentativas" value={String(stats.total)} />
      </section>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={areaFiltro === 'todas'} onClick={() => setAreaFiltro('todas')}>
          Todas
        </FilterChip>
        {banco.meta.areas.map((a) => (
          <FilterChip key={a} active={areaFiltro === a} onClick={() => setAreaFiltro(a)}>
            {a}
          </FilterChip>
        ))}
      </div>

      <article className="card rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{caso.area}</span>
          <span className="text-xs text-muted">{caso.exame}</span>
          <span className="ml-auto text-xs text-muted">
            {idx + 1}/{ordem.length}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{caso.enunciado}</p>

        <p className="mt-5 mb-3 text-sm font-semibold text-ink">Qual peça você elaboraria?</p>

        <div className="space-y-2">
          {caso.alternativas.map((alt) => {
            const isSel = selecionada === alt
            const isCorreta = alt === caso.peca_correta
            let cls = 'border-slate-200 bg-white hover:border-brand-300'
            if (revelado && isCorreta) cls = 'border-green-400 bg-green-50'
            else if (revelado && isSel && !isCorreta) cls = 'border-red-300 bg-red-50'
            else if (isSel) cls = 'border-brand-400 bg-brand-50'

            return (
              <button
                key={alt}
                type="button"
                disabled={revelado}
                onClick={() => setSelecionada(alt)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${cls} disabled:cursor-default`}
              >
                {alt}
                {revelado && isCorreta && <span className="ml-2 text-green-600">✓</span>}
              </button>
            )
          })}
        </div>

        {revelado && (
          <div className={`mt-4 rounded-xl p-3 text-sm ${selecionada === caso.peca_correta ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>
            <p className="font-semibold">
              {selecionada === caso.peca_correta ? 'Correto!' : `A peça correta é: ${caso.peca_correta}`}
            </p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">{caso.explicacao}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {!revelado ? (
            <button
              type="button"
              onClick={confirmar}
              disabled={!selecionada}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Confirmar
            </button>
          ) : (
            <button type="button" onClick={proximo} className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white">
              Próximo caso →
            </button>
          )}
        </div>
      </article>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${highlight ? 'text-green-600' : 'text-ink'}`}>{value}</p>
      <p className="mt-1 text-[10px] text-muted">{label}</p>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'bg-surface-700 text-muted hover:text-brand-600'
      }`}
    >
      {children}
    </button>
  )
}
