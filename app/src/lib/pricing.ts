/** Exibição comercial (âncora vs promocional). Cobrança real = API Asaas / env. */
export const LAUNCH_OFFER_LABEL = 'Oferta de lançamento'

export type PaidPlanId = 'pro' | 'reta'

export const PROMO_PRICING: Record<
  PaidPlanId,
  {
    compareAt: string
    price: string
    period: string
    savingsLine: string
  }
> = {
  pro: {
    compareAt: '49,90',
    price: '24,90',
    period: '/mês',
    savingsLine: 'Economize 50% nesta oferta',
  },
  reta: {
    compareAt: '119,70',
    price: '59,90',
    period: '/3 meses',
    savingsLine: 'Melhor custo na reta final — ~50% vs. referência',
  },
}

export const PRO_BONUS_TEASER =
  'Bônus Pro: Kit Aprovador (3 guias para salvar em PDF) + convite ao grupo Dicas OAB no WhatsApp após confirmação do pagamento.'
