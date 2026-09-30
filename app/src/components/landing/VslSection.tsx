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
      className={compact ? 'border-t border-slate-200 bg-surface-900 px-4 py-12 md:px-8' : 'bg-surface-900 px-4 py-16 md:px-8 md:py-20'}
    >
      <div className={`mx-auto ${portrait ? 'max-w-lg' : 'max-w-4xl'}`}>
        <Reveal className={compact ? 'text-center' : 'text-center md:mb-2'}>
          {!compact && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Como funciona</p>
          )}
          <h2 className={`font-bold text-ink ${compact ? 'text-2xl md:text-3xl' : 'mt-3 text-3xl md:text-4xl'}`}>
            {compact ? 'Veja antes de assinar' : 'Será que você passaria hoje na OAB?'}
          </h2>
          {!compact && (
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Em poucos minutos: o método, o simulado real de 5 horas e a oferta de lançamento do Pro.
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
            {' · '}
            Reta Final{' '}
            <span className="font-semibold text-ink">
              R$ {PROMO_PRICING.reta.price}
              {PROMO_PRICING.reta.period}
            </span>
          </p>
          <Link
            to="/planos"
            className="mt-4 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Ver planos e assinar
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
