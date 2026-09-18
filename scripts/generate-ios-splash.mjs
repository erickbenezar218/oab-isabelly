#!/usr/bin/env node
/** Splash iOS com fundo SimulaOrdem + logo (substitui o padrão Capacitor). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const require = createRequire(path.join(root, 'app/package.json'))
const sharp = require('sharp')
const logoPath = path.join(root, 'app/public/logo-icon.svg')
const outDir = path.join(root, 'app/ios/App/App/Assets.xcassets/Splash.imageset')

if (!fs.existsSync(logoPath)) {
  console.warn('→ logo-icon.svg não encontrado — pule splash')
  process.exit(0)
}

const bg = '#1C3F3A'
const size = 2732
const logoSize = 360

const logo = await sharp(logoPath).resize(logoSize, logoSize).png().toBuffer()
const splash = await sharp({
  create: { width: size, height: size, channels: 4, background: bg },
})
  .composite([{ input: logo, gravity: 'centre' }])
  .png()
  .toBuffer()

fs.mkdirSync(outDir, { recursive: true })
for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  fs.writeFileSync(path.join(outDir, name), splash)
}
try {
  const { execSync } = await import('node:child_process')
  execSync(`xattr -cr "${outDir}"`, { stdio: 'ignore' })
} catch {
  /* ok */
}
console.log('→ Splash iOS gerado (SimulaOrdem)')
