import { useCallback, useEffect, useState } from 'react'
import { defaultProgress, STORAGE_KEY, type UserProgress } from '../types'

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return { ...defaultProgress(), ...JSON.parse(raw) }
  } catch {
    return defaultProgress()
  }
}

export function useProgress() {
  const [progress, setProgressState] = useState<UserProgress>(loadProgress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const setProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgressState((prev) => {
      const next = updater(prev)
      return next
    })
  }, [])

  const registrarResposta = useCallback(
    (entry: UserProgress['respostas'][0]) => {
      setProgress((prev) => ({
        ...prev,
        respostas: [...prev.respostas.filter((r) => r.questaoId !== entry.questaoId || r.modulo !== entry.modulo), entry],
      }))
    },
    [setProgress],
  )

  const toggleSalvarRevisao = useCallback(
    (questaoId: string) => {
      setProgress((prev) => {
        const exists = prev.salvosRevisao.includes(questaoId)
        return {
          ...prev,
          salvosRevisao: exists
            ? prev.salvosRevisao.filter((id) => id !== questaoId)
            : [...prev.salvosRevisao, questaoId],
        }
      })
    },
    [setProgress],
  )

  const addCustomCard = useCallback(
    (card: UserProgress['customCards'][0]) => {
      setProgress((prev) => ({ ...prev, customCards: [card, ...prev.customCards] }))
    },
    [setProgress],
  )

  const removeCustomCard = useCallback(
    (id: string) => {
      setProgress((prev) => ({
        ...prev,
        customCards: prev.customCards.filter((c) => c.id !== id),
      }))
    },
    [setProgress],
  )

  const updateStreak = useCallback(
    (acertou: boolean) => {
      setProgress((prev) => {
        const today = new Date().toISOString().slice(0, 10)
        if (!acertou) return { ...prev, flashcardStreak: 0, flashcardLastDate: today }
        const continued = prev.flashcardLastDate === today
        const newStreak = continued ? prev.flashcardStreak + 1 : prev.flashcardStreak === 0 ? 1 : prev.flashcardStreak + 1
        return { ...prev, flashcardStreak: newStreak, flashcardLastDate: today }
      })
    },
    [setProgress],
  )

  const saveSimulado = useCallback(
    (result: UserProgress['simulados'][0]) => {
      setProgress((prev) => ({ ...prev, simulados: [result, ...prev.simulados] }))
    },
    [setProgress],
  )

  const exportProgress = useCallback(() => {
    const payload = {
      version: 1,
      app: 'oab-isabelly',
      exportedAt: new Date().toISOString(),
      progress,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oab-isabelly-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [progress])

  const importProgress = useCallback(
    (file: File): Promise<'ok' | 'invalid'> =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const raw = JSON.parse(String(reader.result))
            const data = raw.progress ?? raw
            const merged: UserProgress = {
              ...defaultProgress(),
              ...data,
              respostas: Array.isArray(data.respostas) ? data.respostas : [],
              salvosRevisao: Array.isArray(data.salvosRevisao) ? data.salvosRevisao : [],
              customCards: Array.isArray(data.customCards) ? data.customCards : [],
              simulados: Array.isArray(data.simulados) ? data.simulados : [],
              flashcardStreak: Number(data.flashcardStreak) || 0,
              flashcardLastDate: String(data.flashcardLastDate ?? ''),
            }
            setProgressState(merged)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
            resolve('ok')
          } catch {
            resolve('invalid')
          }
        }
        reader.onerror = () => resolve('invalid')
        reader.readAsText(file)
      }),
    [],
  )

  return {
    progress,
    registrarResposta,
    toggleSalvarRevisao,
    addCustomCard,
    removeCustomCard,
    updateStreak,
    saveSimulado,
    exportProgress,
    importProgress,
  }
}

export function useQuestions() {
  const [questoes, setQuestoes] = useState<import('../types').Questao[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState<import('../types').BancoOAB['meta'] | null>(null)

  useEffect(() => {
    fetch('/banco_oab.json')
      .then((r) => r.json())
      .then((data: import('../types').BancoOAB) => {
        setQuestoes(data.questoes)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }, [])

  return { questoes, meta, loading }
}

export function diasParaProva(): number {
  const now = new Date()
  const diff = new Date('2026-09-06').getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function formatTempo(seg: number): string {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
