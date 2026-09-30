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
  'Bônus Pro: Kit Aprovador — 3 guias em PDF (anexo no e-mail) + acesso online com sua conta Pro.'

/** Lista fixa para landing / kit (conteúdo real só após Pro). */
export const PRO_BONUS_GUIDES = [
  {
    id: 'roteiro-estrategico',
    title: 'Roteiro estratégico — 1ª Fase OAB',
    description: 'Matemática da aprovação, blocos de matérias, ciclo semanal e simulados no SimulaOrdem.',
  },
  {
    id: 'assuntos-mais-cobrados',
    title: 'Mapa de assuntos prioritários',
    description: 'Eixos por disciplina + como personalizar pelo Desempenho no app.',
  },
  {
    id: 'artigos-mais-cobrados',
    title: 'Artigos e dispositivos de alta recorrência',
    description: 'Lei seca direcionada para revisão com simulados e Professor IA.',
  },
] as const
