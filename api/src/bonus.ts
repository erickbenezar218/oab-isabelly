import { appUrl } from './email.js'

export type BonusPdfItem = {
  id: string
  title: string
  description: string
  url: string
}

export function getWhatsAppGroupUrl(): string | null {
  const url = process.env.WHATSAPP_GROUP_URL?.trim()
  return url || null
}

function pdfUrl(envKey: string, defaultPath: string): string {
  const custom = process.env[envKey]?.trim()
  if (custom) return custom
  return `${appUrl()}${defaultPath}`
}

/** Links do Kit Aprovador (e-mail pós-Pro e página /kit-oab). */
export function getBonusKitConfig() {
  const kitPageUrl = `${appUrl()}/kit-oab`
  const whatsappGroupUrl = getWhatsAppGroupUrl()

  const pdfs: BonusPdfItem[] = [
    {
      id: 'roteiro-estrategico',
      title: 'Roteiro estratégico — 1ª Fase OAB',
      description: 'Matemática da aprovação, blocos de matérias, ciclo semanal e simulados no SimulaOrdem.',
      url: pdfUrl('BONUS_PDF_ROTEIRO_1', '/bonus/roteiro-estrategico-1a-fase.html'),
    },
    {
      id: 'assuntos-1a',
      title: 'Mapa de assuntos prioritários',
      description: 'Eixos por disciplina + como personalizar pelo Desempenho no app.',
      url: pdfUrl('BONUS_PDF_ASSUNTOS_1', '/bonus/assuntos-mais-cobrados-1a-fase.html'),
    },
    {
      id: 'artigos-1a',
      title: 'Artigos e dispositivos de alta recorrência',
      description: 'Lei seca direcionada para revisão com simulados e Professor IA.',
      url: pdfUrl('BONUS_PDF_ARTIGOS_1', '/bonus/artigos-mais-cobrados-1a-fase.html'),
    },
  ]

  return { kitPageUrl, whatsappGroupUrl, pdfs }
}
