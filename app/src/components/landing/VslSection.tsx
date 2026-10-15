import { Link } from 'react-router-dom'
import { Reveal } from './motion'
import { vslEmbedSrc, vslIsPortrait } from '../../lib/vsl'
import { LAUNCH_OFFER_LABEL, PROMO_PRICING } from '../../lib/pricing'

type VslSectionProps = {
  variant?: 'landing' | 'planos'
}

export default function VslSection({ variant = 'landing' }: VslSectionProps) {
  const embed = vslEmbedSrc()
  if (!embed) return null

  const portrait = vslIsPortrait()
  const compact = variant === 'planos'

  return (
    <section
      id={variant === 'landing' ? 'video' : undefined}
      className={compact ? 'border-t border-slate-200 bg-surface-900 px-4 py-16 md:px-8 md:py-24' : 'bg-surface-900 px-4 py-16 md:px-8 md:py-20'}
    >
      <div className={`mx-auto ${portrait ? 'max-w-lg' : 'max-w-4xl'}`}>
        <Reveal className={compact ? 'text-center' : 'text-center md:mb-2'}>
          <h2 className="text-balance font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.01em] text-ink md:text-[2.75rem]">
            {compact ? 'Veja antes de assinar' : 'Será que você passaria hoje na OAB?'}
          </h2>
          {!compact && (
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Assista em 1 minuto: termômetro, simulados, Professor IA, 2ª fase e oferta Pro de lançamento.
            </p>
          )}
        </Reveal>

        <Reveal delay={80} className={`${compact ? 'mt-8' : 'mt-10'} flex justify-center`}>
          <div
            className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg ${
              portrait ? 'aspect-[9/16] max-w-sm' : 'aspect-video'
            }`}
          >
            <iframe
              title="SimulaOrdem — como funciona"
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-8 text-center">
          <p className="text-sm text-muted">
            {LAUNCH_OFFER_LABEL}: Pro por{' '}
            <span className="font-semibold text-ink">R$ {PROMO_PRICING.pro.price}/mês</span>
            {', '}
            Reta Final por{' '}
            <span className="font-semibold text-ink">
              R$ {PROMO_PRICING.reta.price}
              {PROMO_PRICING.reta.period}
            </span>
          </p>
          <Link
            to="/planos"
            className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
          >
            Ver planos e assinar
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
