import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiGetProgress, apiSaveProgress, apiUpdateProfile } from '../lib/api'
import { defaultProgress, STORAGE_KEY, type UserProgress } from '../types'

function loadLocalProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw)
    return { ...defaultProgress(), ...parsed, profile: { ...defaultProgress().profile, ...(parsed.profile ?? {}) } }
  } catch {
    return defaultProgress()
  }
}

function studyDataOnly(progress: UserProgress): Record<string, unknown> {
  const { profile: _profile, ...rest } = progress
  return rest as Record<string, unknown>
}

export function useProgress() {
  const { token, setLimits, applyUser } = useAuth()
  const [progress, setProgressState] = useState<UserProgress>(loadLocalProgress)
  const [syncing, setSyncing] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) {
      setProgressState(loadLocalProgress())
      return
    }
    setSyncing(true)
    apiGetProgress(token)
      .then(({ progress: remote, limits }) => {
        const merged = {
          ...defaultProgress(),
          ...remote,
          profile: { ...defaultProgress().profile, ...(remote.profile as UserProgress['profile'] ?? {}) },
        } as UserProgress
        setProgressState(merged)
        setLimits(limits)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      })
      .catch(() => setProgressState(loadLocalProgress()))
      .finally(() => setSyncing(false))
  }, [token, setLimits])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    if (!token) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      apiSaveProgress(token, studyDataOnly(progress)).catch(() => {})
    }, 800)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [progress, token])

  const setProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgressState((prev) => updater(prev))
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
          salvosRevisao: exists ? prev.salvosRevisao.filter((id) => id !== questaoId) : [...prev.salvosRevisao, questaoId],
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
      setProgress((prev) => ({ ...prev, customCards: prev.customCards.filter((c) => c.id !== id) }))
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

  const updateProfile = useCallback(
    async (patch: Partial<UserProgress['profile']>) => {
      setProgress((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...patch },
      }))
      if (!token) return
      const { profile, user } = await apiUpdateProfile(token, patch)
      setProgress((prev) => {
        const next = { ...prev, profile }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
      applyUser(user)
    },
    [token, applyUser],
  )

  const registrarPeca = useCallback(
    (entry: UserProgress['pecasRespostas'][0]) => {
      setProgress((prev) => ({
        ...prev,
        pecasRespostas: [...prev.pecasRespostas.filter((p) => p.casoId !== entry.casoId), entry],
      }))
    },
    [setProgress],
  )

  return {
    progress,
    syncing,
    registrarResposta,
    toggleSalvarRevisao,
    addCustomCard,
    removeCustomCard,
    updateStreak,
    saveSimulado,
    registrarPeca,
    updateProfile,
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

export { diasParaProva } from '../lib/cronograma'

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
