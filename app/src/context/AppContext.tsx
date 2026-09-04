import { createContext, useContext, type ReactNode } from 'react'
import { useProgress, useQuestions } from '../hooks/useAppData'

type AppContextType = ReturnType<typeof useProgress> & ReturnType<typeof useQuestions>

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const progress = useProgress()
  const questions = useQuestions()
  return <AppContext.Provider value={{ ...progress, ...questions }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
