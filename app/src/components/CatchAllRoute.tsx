import { Navigate } from 'react-router-dom'
import { isNativeApp } from '../lib/platform'

export default function CatchAllRoute() {
  return <Navigate to={isNativeApp() ? '/login' : '/'} replace />
}
