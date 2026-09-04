import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { diasParaProva } from '../hooks/useAppData'

export default function Dashboard() {
  const { questoes, progress, loading, meta, exportProgress, importProgress } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [backupMsg, setBackupMsg] = useState<string | null>(null)
  const dias = diasParaProva()

  const totalRespondidas = progress.respostas.length
  const acertos = progress.respostas.filter((r) => r.correta).length
  const pctAcerto = totalRespondidas > 0 ? Math.round((acertos / totalRespondidas) * 100) : 0
  const salvos = progress.salvosRevisao.length

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="glow-pulse rounded-2xl bg-gradient-to-br from-brand-700/40 to-surface-700 p-5">
        <p className="text-sm text-brand-200">Contagem regressiva</p>
        <p className="mt-1 text-3xl font-extrabold text-white">
          {dias === 0 ? 'É HOJE! 🎯' : `Faltam ${dias} dias`}
        </p>
        <p className="mt-1 text-sm text-purple-200/80">para o dia 06/09/2026!</p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Respondidas" value={String(totalRespondidas)} />
        <StatCard label="Acerto geral" value={`${pctAcerto}%`} highlight={pctAcerto >= 50} />
        <StatCard label="Salvos revisão" value={String(salvos)} />
      </section>

      <section className="rounded-2xl bg-surface-800 p-4">
        <h2 className="mb-3 font-semibold text-white">Banco de questões</h2>
        <p className="text-sm text-purple-200/70">
          {meta?.total_questoes ?? questoes.length} questões · {meta?.examenes?.length ?? 0} exames
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(meta?.examenes ?? []).slice(0, 5).map((e) => (
            <span key={e} className="rounded-full bg-surface-700 px-2.5 py-1 text-xs text-brand-200">
              {e}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-white">Módulos de estudo</h2>
        <ModuleLink
          to="/flashcards"
          emoji="⚡"
          title="Flashcards Rápidos"
          desc="Active recall estilo swipe — errei ou acertei!"
        />
        <ModuleLink
          to="/simulado"
          emoji="📝"
          title="Simulado Realista"
          desc="80 questões · 5 horas · cronômetro por questão"
        />
        <ModuleLink
          to="/desempenho"
          emoji="📊"
          title="Painel de Desempenho"
          desc="Gráficos por matéria + cards customizados"
        />
      </section>

      {progress.flashcardStreak >= 3 && (
        <p className="text-center text-sm text-brand-300">
          🔥 Sequência de {progress.flashcardStreak} acertos nos flashcards!
        </p>
      )}

      <section className="rounded-2xl bg-surface-800 p-4">
        <h2 className="font-semibold text-white">Backup dos dados 💾</h2>
        <p className="mt-1 text-xs leading-relaxed text-purple-300/60">
          O progresso fica salvo <strong className="text-purple-200">só neste navegador</strong>. Para trocar de celular,
          navegador ou iPad, exporte aqui e importe no outro aparelho.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={exportProgress}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
          >
            Exportar backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-xl bg-surface-700 py-2.5 text-sm font-semibold text-purple-100"
          >
            Importar backup
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const ok = await importProgress(file)
            setBackupMsg(ok === 'ok' ? '✅ Backup restaurado com sucesso!' : '❌ Arquivo inválido.')
            e.target.value = ''
            setTimeout(() => setBackupMsg(null), 4000)
          }}
        />
        {backupMsg && <p className="mt-2 text-center text-xs text-brand-200">{backupMsg}</p>}
      </section>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-800 p-3 text-center">
      <p className={`text-xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</p>
      <p className="mt-1 text-[10px] leading-tight text-purple-300/60">{label}</p>
    </div>
  )
}

function ModuleLink({ to, emoji, title, desc }: { to: string; emoji: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl bg-surface-800 p-4 transition hover:bg-surface-700 active:scale-[0.98]"
    >
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-purple-200/60">{desc}</p>
      </div>
      <span className="ml-auto text-brand-400">→</span>
    </Link>
  )
}
