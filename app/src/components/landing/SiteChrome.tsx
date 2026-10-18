import { Link } from 'react-router-dom'
import { useScrolled } from './motion'

const navItems = [
  { hash: 'recursos', label: 'Recursos' },
  { hash: 'desempenho', label: 'Desempenho' },
  { hash: 'ia', label: 'Tutor IA' },
]

const navLink = 'transition-colors duration-150 hover:text-brand-600'

/** Cabeçalho das páginas públicas (landing e planos). */
export function SiteHeader({
  ctaTo,
  ctaLabel,
  current,
  onCtaClick,
}: {
  ctaTo: string
  ctaLabel: string
  current: 'landing' | 'planos'
  onCtaClick?: () => void
}) {
  const scrolled = useScrolled()

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-[padding,border-color] duration-200 safe-top ${
        scrolled ? 'border-slate-200 py-3' : 'border-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8">
        <Link to="/" aria-label="SimulaOrdem, página inicial">
          <img src="/logo.svg" alt="SimulaOrdem" className="h-9 w-auto" />
        </Link>
        <nav aria-label="Seções" className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          {navItems.map(({ hash, label }) =>
            current === 'landing' ? (
              <a key={hash} href={`#${hash}`} className={navLink}>
                {label}
              </a>
            ) : (
              <Link key={hash} to={`/#${hash}`} className={navLink}>
                {label}
              </Link>
            ),
          )}
          {current === 'planos' ? (
            <span aria-current="page" className="text-brand-600">
              Planos
            </span>
          ) : (
            <Link to="/planos" className={navLink}>
              Planos
            </Link>
          )}
        </nav>
        <Link
          to={ctaTo}
          onClick={onCtaClick}
          className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  )
}

/** Rodapé das páginas públicas (landing e planos). */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/logo.svg" alt="SimulaOrdem" className="h-10 w-auto" />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Preparação completa para a OAB: simulados, peças processuais e estudo guiado por dados.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Produto</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/login" className={navLink}>
                Entrar
              </Link>
            </li>
            <li>
              <Link to="/planos" className={navLink}>
                Planos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Legal e suporte</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/termos" className={navLink}>
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className={navLink}>
                Política de Privacidade (LGPD)
              </Link>
            </li>
            <li>
              <a href="mailto:suporte@simulaordem.com.br" className={navLink}>
                suporte@simulaordem.com.br
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted">
        © {new Date().getFullYear()} SimulaOrdem. R E BENEZAR DE SOUZA LTDA, CNPJ 37.409.487/0001-70
      </p>
    </footer>
  )
}
