import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appUrl } from './email.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type BonusGuideId = 'roteiro-estrategico' | 'assuntos-mais-cobrados' | 'artigos-mais-cobrados'

export const BONUS_GUIDE_CATALOG: {
  id: BonusGuideId
  file: string
  pdfFile: string
  title: string
  description: string
}[] = [
  {
    id: 'roteiro-estrategico',
    file: 'roteiro-estrategico-1a-fase.html',
    pdfFile: 'roteiro-estrategico-1a-fase.pdf',
    title: 'Roteiro estratégico — 1ª Fase OAB',
    description: 'Matemática da aprovação, blocos de matérias, ciclo semanal e simulados no SimulaOrdem.',
  },
  {
    id: 'assuntos-mais-cobrados',
    file: 'assuntos-mais-cobrados-1a-fase.html',
    pdfFile: 'assuntos-mais-cobrados-1a-fase.pdf',
    title: 'Mapa de assuntos prioritários',
    description: 'Eixos por disciplina + como personalizar pelo Desempenho no app.',
  },
  {
    id: 'artigos-mais-cobrados',
    file: 'artigos-mais-cobrados-1a-fase.html',
    pdfFile: 'artigos-mais-cobrados-1a-fase.pdf',
    title: 'Artigos e dispositivos de alta recorrência',
    description: 'Lei seca direcionada para revisão com simulados e Professor IA.',
  },
]

function guidesRoot(): string {
  for (const c of [path.join(__dirname, 'bonus-guides'), path.join(__dirname, '..', 'bonus-guides')]) {
    if (fs.existsSync(c)) return c
  }
  return path.join(__dirname, '..', 'bonus-guides')
}

function readGuideHtml(file: string): string {
  const raw = fs.readFileSync(path.join(guidesRoot(), file), 'utf8')
  const css = fs.readFileSync(path.join(guidesRoot(), 'simulaordem-kit.css'), 'utf8')
  const base = appUrl()
  return raw
    .replace('<link rel="stylesheet" href="simulaordem-kit.css" />', `<style>${css}</style>`)
    .replace('src="../logo.svg"', `src="${base}/logo.svg"`)
    .replace(/href="https:\/\/simulaordem\.com\.br/g, `href="${base}`)
}

export function getGuideHtmlById(guideId: string): string | null {
  const meta = BONUS_GUIDE_CATALOG.find((g) => g.id === guideId)
  if (!meta) return null
  try {
    return readGuideHtml(meta.file)
  } catch {
    return null
  }
}

export function getBonusPdfPath(pdfFile: string): string | null {
  const pdfDir = path.join(guidesRoot(), 'pdf')
  const full = path.join(pdfDir, pdfFile)
  return fs.existsSync(full) ? full : null
}

export function listBonusAttachments(): { filename: string; path: string }[] {
  const out: { filename: string; path: string }[] = []
  for (const g of BONUS_GUIDE_CATALOG) {
    const p = getBonusPdfPath(g.pdfFile)
    if (p) {
      out.push({
        filename: `SimulaOrdem-${g.id}.pdf`,
        path: p,
      })
    }
  }
  return out
}

export function bonusKitForClient() {
  const kitPageUrl = `${appUrl()}/kit-oab`
  const guides = BONUS_GUIDE_CATALOG.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    viewUrl: `${kitPageUrl}/guia/${g.id}`,
  }))
  return { kitPageUrl, guides }
}
