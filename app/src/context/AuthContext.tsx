import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiGoogleLogin, apiLogin, apiMe, apiRegister, apiVerifyOtp, type AuthUser, type LoginResult, type PlanLimits } from '../lib/api'

const TOKEN_KEY = 'simulaordem-token'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  limits: PlanLimits | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  verifyOtp: (challengeId: string, code: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  googleLogin: (credential: string) => Promise<void>
  logout: () => void
  setLimits: (limits: PlanLimits) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)

  const persist = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setLimits(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const { user: u } = await apiMe(token)
    setUser(u)
  }, [token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    apiMe(token)
      .then(({ user: u }) => setUser(u))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [token, logout])

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password)
    if ('requiresOtp' in result && result.requiresOtp) return result
    persist(result.token, result.user)
    return result
  }

  const verifyOtp = async (challengeId: string, code: string) => {
    const { token: t, user: u } = await apiVerifyOtp(challengeId, code)
    persist(t, u)
  }

  const register = async (email: string, password: string, name: string) => {
    const { token: t, user: u } = await apiRegister(email, password, name)
    persist(t, u)
  }

  const googleLogin = async (credential: string) => {
    const { token: t, user: u } = await apiGoogleLogin(credential)
    persist(t, u)
  }

  return (
    <AuthContext.Provider value={{ user, token, limits, loading, login, verifyOtp, register, googleLogin, logout, setLimits, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
