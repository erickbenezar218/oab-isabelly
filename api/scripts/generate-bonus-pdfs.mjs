#!/usr/bin/env node
/**
 * Gera PDFs do Kit Aprovador a partir dos HTML em api/bonus-guides/.
 * Requer: npx playwright install chromium (uma vez)
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bonus-guides')
const outDir = path.join(root, 'pdf')
const files = [
  'roteiro-estrategico-1a-fase.html',
  'assuntos-mais-cobrados-1a-fase.html',
  'artigos-mais-cobrados-1a-fase.html',
]

fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()

for (const file of files) {
  const htmlPath = path.join(root, file)
  const pdfName = file.replace(/\.html$/, '.pdf')
  const pdfPath = path.join(outDir, pdfName)
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
  })
  console.log('OK', pdfPath)
}

await browser.close()
