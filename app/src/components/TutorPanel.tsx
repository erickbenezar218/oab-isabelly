import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  apiTutorChat,
  apiTutorComment,
  apiTutorCommentCached,
  apiTutorThread,
  type TutorMessage,
  type TutorQuestaoPayload,
} from '../lib/api'
import type { Questao } from '../types'

function toPayload(q: Questao): TutorQuestaoPayload {
  return {
    id: q.id,
    materia: q.materia,
    exame: q.exame,
    enunciado: q.enunciado,
    alternativas: q.alternativas,
    resposta_correta: q.resposta_correta,
  }
}

export default function TutorPanel({
  questao,
  respostaUsuario,
}: {
  questao: Questao
  respostaUsuario: string | null
}) {
  const { token, limits, user } = useAuth()
  const [explanation, setExplanation] = useState<string | null>(null)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [remaining, setRemaining] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const canChat = limits?.tutorChat ?? user?.plan === 'pro'

  useEffect(() => {
    setExplanation(null)
    setMessages([])
    setError('')
    setInput('')
    setLoaded(false)
  }, [questao.id])

  useEffect(() => {
    if (!token) {
      setLoaded(true)
      return
    }
    apiTutorCommentCached(questao.id)
      .then((data) => {
        if (data.explanation) {
          setExplanation(data.explanation)
          setMessages([{ role: 'assistant', content: data.explanation, createdAt: new Date().toISOString() }])
        }
      })
      .finally(() => setLoaded(true))

    if (canChat) {
      apiTutorThread(token, questao.id)
        .then((data) => {
          if (data.explanation) {
            setExplanation(data.explanation)
            setMessages(data.messages)
            setRemaining(data.remainingMessages)
          }
        })
        .catch(() => {})
    }
  }, [token, canChat, questao.id, respostaUsuario])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const explain = async () => {
    if (!token) return
    setExplaining(true)
    setError('')
    try {
      const data = await apiTutorComment(token, toPayload(questao), respostaUsuario)
      setExplanation(data.explanation)
      setMessages([{ role: 'assistant', content: data.explanation, createdAt: new Date().toISOString() }])
      setRemaining(data.remainingMessages ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao explicar')
    } finally {
      setExplaining(false)
    }
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !input.trim() || loading || !canChat) return
    setLoading(true)
    setError('')
    const text = input.trim()
    setInput('')
    try {
      const data = await apiTutorChat(token, toPayload(questao), respostaUsuario, text)
      setMessages(data.messages)
      setRemaining(data.remainingMessages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no chat')
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  if (!loaded) {
    return (
      <div className="card rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Carregando IA...
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-brand-50 p-4">
        <p className="text-sm font-medium text-brand-700">✨ Professor IA</p>
        <p className="mt-1 text-xs text-muted">Entre na conta para ver explicações geradas por IA.</p>
        <Link to="/login" className="mt-3 inline-block text-xs font-semibold text-brand-600 underline">
          Fazer login
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">✨ Professor IA</p>
        {canChat && explanation && (
          <span className="text-[10px] text-muted">{remaining} perguntas restantes</span>
        )}
      </div>

      {!explanation ? (
        <>
          <p className="mt-2 text-xs text-muted">
            Gabarito comentado por IA — sem professor humano, explicação na hora.
            {limits?.iaExplicacoesDia != null && (
              <span className="block mt-1 text-muted-light">Plano grátis: até {limits.iaExplicacoesDia} explicações novas/dia.</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => void explain()}
            disabled={explaining}
            className="mt-3 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {explaining ? 'IA analisando...' : 'Ver explicação IA'}
          </button>
        </>
      ) : (
        <>
          <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={`${m.createdAt}-${i}`}
                className={`rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                  m.role === 'assistant' ? 'bg-brand-50 text-ink' : 'bg-surface-700 text-ink'
                }`}
              >
                {m.role === 'assistant' && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-500">Professor IA</p>
                )}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                IA pensando...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {canChat && remaining > 0 ? (
            <form onSubmit={send} className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tire sua dúvida sobre esta questão..."
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Enviar
              </button>
            </form>
          ) : !canChat ? (
            <p className="mt-3 text-center text-xs text-muted">
              Chat ilimitado no{' '}
              <Link to="/planos" className="font-semibold text-brand-600 underline">
                plano Pro
              </Link>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-muted">Limite de perguntas nesta questão atingido.</p>
          )}
        </>
      )}

      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
