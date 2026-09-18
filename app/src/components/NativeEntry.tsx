import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** No app nativo iOS/Android, / redireciona para login ou app. */
export default function NativeEntry() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return <Navigate to={user ? '/app' : '/login'} replace />
}
