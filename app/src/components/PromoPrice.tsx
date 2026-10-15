import { LAUNCH_OFFER_LABEL, PROMO_PRICING, type PaidPlanId } from '../lib/pricing'

export function PromoPrice({
  planId,
  featured = false,
  size = 'lg',
}: {
  planId: PaidPlanId
  featured?: boolean
  size?: 'md' | 'lg'
}) {
  const p = PROMO_PRICING[planId]
  const priceClass = size === 'lg' ? 'text-5xl' : 'text-4xl'

  return (
    <div>
      <p className={`text-xs font-semibold ${featured ? 'text-brand-200' : 'text-brand-500'}`}>
        {LAUNCH_OFFER_LABEL}, de <span className="line-through">R$ {p.compareAt}</span> por
      </p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-sm font-medium ${featured ? 'text-white/70' : 'text-muted'}`}>R$</span>
        <span
          className={`${priceClass} font-display font-medium leading-none tracking-[-0.02em] tabular-nums ${
            featured ? 'text-white' : 'text-ink'
          }`}
        >
          {p.price}
        </span>
        <span className={`text-sm ${featured ? 'text-white/70' : 'text-muted'}`}>{p.period}</span>
      </div>
      <p className={`mt-2 text-xs ${featured ? 'text-brand-200' : 'text-brand-600'}`}>{p.savingsLine}</p>
    </div>
  )
}
