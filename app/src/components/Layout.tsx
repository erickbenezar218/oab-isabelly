import { NavLink, Outlet } from 'react-router-dom'
import OnboardingModal from './OnboardingModal'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/app', label: 'Início', icon: '🏠' },
  { to: '/app/flashcards', label: 'Cards', icon: '⚡' },
  { to: '/app/simulado', label: 'Simulado', icon: '📝' },
  { to: '/app/desempenho', label: 'Stats', icon: '📊' },
  { to: '/app/cronograma', label: 'Meta', icon: '📅' },
  { to: '/app/pecas', label: '2ª fase', icon: '⚖️' },
]

export default function Layout() {
  const { user, limits, logout } = useAuth()
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-surface-900">
      <OnboardingModal />
      <header className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-md safe-top">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/logo-icon.svg" alt="" className="h-9 w-9 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-brand-500">SimulaOrdem</p>
              <h1 className="truncate text-sm font-bold text-ink md:text-base">Olá, {user?.name?.split(' ')[0] ?? 'estudante'}!</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NavLink
              to="/planos"
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${isPro ? 'bg-green-50 text-green-700' : 'bg-surface-700 text-muted'}`}
            >
              {isPro ? 'PRO' : 'FREE'}
            </NavLink>
            <button type="button" onClick={logout} className="text-lg text-muted hover:text-ink" title="Sair">
              ⎋
            </button>
          </div>
        </div>
      </header>

      <main className="app-scroll mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 py-4 pb-28 md:px-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-3xl justify-around gap-0.5 overflow-x-auto px-1 py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/app'}
              className={({ isActive }) =>
                `flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-muted hover:text-brand-500'
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
