import { Link, NavLink, Outlet } from 'react-router-dom'
import OnboardingModal from './OnboardingModal'
import WelcomeTour from './WelcomeTour'
import UpgradeCard from './ui/UpgradeCard'
import {
  IconCalendar,
  IconChart,
  IconClipboard,
  IconHome,
  IconLogout,
  IconRefresh,
  IconScale,
  IconSettings,
  IconZap,
  type IconProps,
} from './icons'
import { useAuth } from '../context/AuthContext'
import type { ComponentType } from 'react'

const sidebarLinks: { to: string; label: string; Icon: ComponentType<IconProps> }[] = [
  { to: '/app', label: 'Início', Icon: IconHome },
  { to: '/app/flashcards', label: 'Flashcards', Icon: IconZap },
  { to: '/app/simulado', label: 'Simulado', Icon: IconClipboard },
  { to: '/app/revisao', label: 'Revisão', Icon: IconRefresh },
  { to: '/app/desempenho', label: 'Desempenho', Icon: IconChart },
  { to: '/app/cronograma', label: 'Meta diária', Icon: IconCalendar },
  { to: '/app/pecas', label: '2ª fase', Icon: IconScale },
]

const mobileLinks: { to: string; label: string; Icon: ComponentType<IconProps> }[] = [
  { to: '/app', label: 'Início', Icon: IconHome },
  { to: '/app/flashcards', label: 'Cards', Icon: IconZap },
  { to: '/app/simulado', label: 'Simulado', Icon: IconClipboard },
  { to: '/app/revisao', label: 'Revisão', Icon: IconRefresh },
  { to: '/app/pecas', label: '2ª fase', Icon: IconScale },
]

function NavItem({ to, label, Icon, end }: { to: string; label: string; Icon: ComponentType<IconProps>; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive ? 'bg-brand-50 text-brand-600' : 'text-muted hover:bg-surface-700 hover:text-ink'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, limits, logout } = useAuth()
  const isPro = limits?.plan === 'pro' || user?.plan === 'pro'

  return (
    <div className="flex min-h-dvh w-full flex-col bg-surface-900 lg:flex-row">
      <OnboardingModal />
      <WelcomeTour />

      {/* Desktop sidebar */}
      <aside className="app-sidebar hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <img src="/logo-icon.svg" alt="" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-bold tracking-tight text-ink">SimulaOrdem</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {sidebarLinks.map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} end={to === '/app'} />
          ))}
        </nav>

        <div className="space-y-3 px-4 pb-6">
          <Link
            to="/app/conta"
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-surface-700/40 px-3 py-2.5 transition hover:border-slate-200 hover:bg-white"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {(user?.name ?? 'E')
                .split(' ')
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user?.name ?? 'Estudante'}</p>
              <p className="truncate text-[10px] text-muted">{user?.email}</p>
            </div>
            <IconSettings size={16} className="shrink-0 text-muted" />
          </Link>
          {!isPro && <UpgradeCard />}
          <NavLink
            to="/planos"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface-700 hover:text-ink"
          >
            Planos
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface-700 hover:text-ink"
          >
            <IconLogout size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="shrink-0 border-b border-slate-200 bg-white safe-top lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo-icon.svg" alt="" className="h-8 w-8 rounded-lg" />
              <div>
                <p className="text-[10px] font-medium text-brand-500">SimulaOrdem</p>
                <p className="text-sm font-bold text-ink">{user?.name?.split(' ')[0] ?? 'Estudante'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/app/conta"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-muted transition hover:bg-brand-50 hover:text-brand-600"
                aria-label="Conta"
              >
                <IconSettings size={18} />
              </Link>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${isPro ? 'bg-green-50 text-green-700' : 'bg-surface-700 text-muted'}`}
              >
                {isPro ? 'PRO' : 'FREE'}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 shadow-nav backdrop-blur-md safe-bottom lg:hidden">
          <div className="mx-auto flex max-w-lg justify-around gap-0.5 px-1 py-2">
            {mobileLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/app'}
                className={({ isActive }) =>
                  `flex min-w-[3rem] flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[9px] transition ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-muted'
                  }`
                }
              >
                <Icon size={18} />
                <span className="font-medium leading-tight">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
