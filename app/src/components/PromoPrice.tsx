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
  const priceClass = size === 'lg' ? 'text-4xl' : 'text-3xl'

  return (
    <div>
      <p
        className={`text-[10px] font-bold uppercase tracking-wide ${
          featured ? 'text-brand-200' : 'text-brand-500'
        }`}
      >
        {LAUNCH_OFFER_LABEL}
      </p>
      <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className={`text-sm line-through ${featured ? 'text-brand-200/90' : 'text-muted-light'}`}>
          R$ {p.compareAt}
        </span>
        <div className="flex items-end gap-1">
          <span className={`text-sm font-medium ${featured ? 'text-brand-100' : 'text-muted'}`}>R$</span>
          <span className={`${priceClass} font-extrabold tracking-tight ${featured ? 'text-white' : 'text-ink'}`}>
            {p.price}
          </span>
          <span className={`mb-1 text-sm ${featured ? 'text-brand-100' : 'text-muted'}`}>{p.period}</span>
        </div>
      </div>
      <p className={`mt-1 text-xs ${featured ? 'text-brand-200' : 'text-brand-600'}`}>{p.savingsLine}</p>
    </div>
  )
}
