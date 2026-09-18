import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconSparkles } from './icons'
import TutorMarkdown from './TutorMarkdown'
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

function MessageBubble({ message }: { message: TutorMessage }) {
  const isAssistant = message.role === 'assistant'
  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        isAssistant ? 'border border-brand-100 bg-white' : 'bg-surface-700'
      }`}
    >
      {isAssistant ? (
        <TutorMarkdown content={message.content} />
      ) : (
        <p className="text-sm leading-relaxed text-ink">{message.content}</p>
      )}
    </div>
  )
}

export default function TutorPanel({
  questao,
  respostaUsuario,
  autoExplain = false,
}: {
  questao: Questao
  respostaUsuario: string | null
  /** @deprecated mantido por compatibilidade; padrão é opt-in manual */
  autoExplain?: boolean
}) {
  const { token, limits, user } = useAuth()
  const [open, setOpen] = useState(autoExplain)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [remaining, setRemaining] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const autoRequested = useRef(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const canChat = limits?.tutorChat ?? user?.plan === 'pro'
  const acertou = respostaUsuario === questao.resposta_correta

  useEffect(() => {
    setOpen(autoExplain)
    setExplanation(null)
    setMessages([])
    setError('')
    setInput('')
    setLoaded(false)
    autoRequested.current = false
  }, [questao.id, autoExplain])

  useEffect(() => {
    if (!open) return
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
  }, [open, token, canChat, questao.id, respostaUsuario])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const explain = useCallback(async () => {
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
  }, [token, questao, respostaUsuario])

  useEffect(() => {
    if (!autoExplain || !token || !loaded || explanation || explaining || autoRequested.current) return
    if (!respostaUsuario) return
    autoRequested.current = true
    void explain()
  }, [autoExplain, token, loaded, explanation, explaining, respostaUsuario, explain])

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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
      >
        <IconSparkles size={16} />
        {acertou ? 'Ver explicação do Professor IA' : 'Por que errei? — Perguntar ao Professor IA'}
      </button>
    )
  }

  if (!loaded) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-brand-100 bg-brand-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
            <IconSparkles size={16} />
            Professor IA
          </p>
        </div>
        <div className="flex items-center gap-2 p-4 text-sm text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Preparando...
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 shadow-sm">
        <div className="px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
            <IconSparkles size={16} />
            Professor IA
          </p>
          <p className="mt-1 text-xs text-muted">Entre na conta para ver explicações geradas por IA.</p>
          <Link to="/login" className="mt-3 inline-block text-xs font-semibold text-brand-600 underline">
            Fazer login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <IconSparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Professor IA</p>
            <p className="text-[11px] text-muted">{questao.materia}</p>
          </div>
        </div>
        {respostaUsuario && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              acertou ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {acertou ? 'Acertou' : `Errou · gabarito ${questao.resposta_correta}`}
          </span>
        )}
      </div>

      <div className="p-4">
        {!explanation ? (
          <>
            <p className="text-sm text-muted">
              {explaining
                ? 'Analisando a questão…'
                : acertou
                  ? 'Quer entender o raciocínio por trás do gabarito? Toque abaixo.'
                  : 'Quer saber por que errou e qual alternativa está certa? Toque abaixo.'}
            </p>
            {limits?.iaExplicacoesDia != null && (
              <p className="mt-1 text-xs text-muted-light">
                Plano grátis: até {limits.iaExplicacoesDia} explicações novas/dia.
              </p>
            )}
            {!explaining ? (
              <button
                type="button"
                onClick={() => void explain()}
                className="btn-primary mt-4 w-full py-2.5 text-sm"
              >
                {acertou ? 'Gerar explicação' : 'Explicar meu erro'}
              </button>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-4 text-sm font-medium text-brand-700">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                IA analisando...
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3">
              {messages.map((m, i) => (
                <MessageBubble key={`${m.createdAt}-${i}`} message={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs text-muted">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  IA pensando...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {canChat && remaining > 0 ? (
              <form onSubmit={send} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tire sua dúvida sobre esta questão..."
                  disabled={loading}
                  className="input-field min-w-0 flex-1 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-40"
                >
                  Enviar
                </button>
              </form>
            ) : !canChat ? (
              <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-muted">
                Chat ilimitado no{' '}
                <Link to="/planos" className="font-semibold text-brand-600 underline">
                  plano Pro
                </Link>
              </p>
            ) : (
              <p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs text-muted">
                Limite de perguntas nesta questão atingido.
              </p>
            )}
          </>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</p>
        )}
      </div>
    </div>
  )
}
