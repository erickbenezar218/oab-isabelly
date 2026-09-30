import { bonusKitForClient } from './bonusGuides.js'

/** Links do Kit Aprovador (e-mail pós-Pro e página /kit-oab). */
export function getBonusKitConfig() {
  const { kitPageUrl, guides } = bonusKitForClient()
  return {
    kitPageUrl,
    guides,
    /** @deprecated use guides */
    pdfs: guides.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      url: g.viewUrl,
    })),
  }
}
