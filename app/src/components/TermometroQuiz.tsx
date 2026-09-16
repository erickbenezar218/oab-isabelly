import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Questao } from '../types'

export default function TermometroQuiz() {
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/banco_oab.json')
      .then((r) => r.json())
      .then((data: { questoes: Questao[] }) => {
        const shuffled = [...data.questoes].sort(() => Math.random() - 0.5).slice(0, 5)
        setQuestoes(shuffled)
      })
  }, [])

  const atual = questoes[idx]
  const pct = done ? Math.round((acertos / 5) * 100) : 0
  const passaria = acertos >= 3

  const responder = (letra: string) => {
    if (!atual || selected) return
    setSelected(letra)
    const ok = letra === atual.resposta_correta
    if (ok) setAcertos((a) => a + 1)
    setTimeout(() => {
      if (idx >= 4) setDone(true)
      else {
        setIdx((i) => i + 1)
        setSelected(null)
      }
    }, 600)
  }

  if (!questoes.length) return null

  if (done) {
    return (
      <div className="card mx-auto mt-10 max-w-lg rounded-2xl p-6 text-center">
        <p className="text-sm font-medium text-brand-600">Termômetro OAB</p>
        <p className="mt-2 text-3xl font-bold text-ink">{pct}%</p>
        <p className="mt-2 text-sm text-muted">
          {passaria ? 'Ritmo bom! Continue treinando para garantir na prova de 80.' : 'Dá para melhorar — o SimulaOrdem monta seu plano com IA.'}
        </p>
        <Link to="/login" className="mt-4 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white">
          Criar conta grátis
        </Link>
      </div>
    )
  }

  return (
    <div className="card mx-auto mt-10 max-w-lg rounded-2xl p-5">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-semibold text-brand-600">Termômetro · 5 questões reais</span>
        <span>{idx + 1}/5</span>
      </div>
      {atual && (
        <>
          <p className="mt-3 text-xs text-brand-500">{atual.materia}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink line-clamp-4">{atual.enunciado}</p>
          <div className="mt-4 space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((letra) => (
              <button
                key={letra}
                type="button"
                disabled={Boolean(selected)}
                onClick={() => responder(letra)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                  selected === letra
                    ? letra === atual.resposta_correta
                      ? 'border-green-400 bg-green-50'
                      : 'border-red-300 bg-red-50'
                    : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                <span className="font-bold text-brand-500">{letra})</span> {atual.alternativas[letra].slice(0, 80)}…
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
