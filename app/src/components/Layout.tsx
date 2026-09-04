import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/flashcards', label: 'Cards', icon: '⚡' },
  { to: '/simulado', label: 'Simulado', icon: '📝' },
  { to: '/desempenho', label: 'Stats', icon: '📊' },
]

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-900">
      <header className="sticky top-0 z-40 border-b border-brand-700/20 bg-surface-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-medium text-brand-300">OAB da Isabelly ⚖️</p>
            <h1 className="text-sm font-bold text-white">Bora gabaritar essa OAB, Isabelly!</h1>
          </div>
          <span className="text-2xl">⚖️</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 safe-bottom pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-700/20 bg-surface-800/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
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
