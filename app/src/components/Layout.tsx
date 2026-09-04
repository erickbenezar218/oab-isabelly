import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/flashcards', label: 'Cards', icon: '⚡' },
  { to: '/simulado', label: 'Simulado', icon: '📝' },
  { to: '/desempenho', label: 'Stats', icon: '📊' },
]

export default function Layout() {
  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-surface-900">
      <header className="shrink-0 border-b border-brand-700/20 bg-surface-900/95 backdrop-blur-md safe-top">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-6">
          <div className="min-w-0 pr-3">
            <p className="text-xs font-medium text-brand-300">OAB da Isabelly ⚖️</p>
            <h1 className="truncate text-sm font-bold text-white md:text-base">
              Bora gabaritar essa OAB, Isabelly!
            </h1>
          </div>
          <span className="shrink-0 text-2xl">⚖️</span>
        </div>
      </header>

      <main className="app-scroll mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 py-4 pb-28 md:px-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-700/20 bg-surface-800/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-3xl justify-around px-2 py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs transition ${
                  isActive ? 'bg-brand-600/20 text-brand-300' : 'text-purple-300/60 hover:text-brand-200'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
