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
      id: 'roteiro-1a',
      title: 'Roteiro de Estudo — 1ª Fase OAB',
      description: 'O que priorizar nos dias que antecedem a prova objetiva.',
      url: pdfUrl('BONUS_PDF_ROTEIRO_1', '/bonus/roteiro-1a-fase.html'),
    },
    {
      id: 'assuntos-1a',
      title: 'Assuntos mais cobrados — 1ª Fase',
      description: 'Direcionamento por matéria (visão geral).',
      url: pdfUrl('BONUS_PDF_ASSUNTOS_1', '/bonus/assuntos-1a-fase.html'),
    },
    {
      id: 'gestao-tempo',
      title: 'Gestão do tempo na prova objetiva',
      description: 'Estratégia de 5 horas e marcação inteligente.',
      url: pdfUrl('BONUS_PDF_GESTAO_TEMPO', '/bonus/gestao-tempo-1a-fase.html'),
    },
  ]

  return { kitPageUrl, whatsappGroupUrl, pdfs }
}
