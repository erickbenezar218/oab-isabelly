#!/usr/bin/env node
/**
 * Atualiza Info.plist: permissões de notificação + URL scheme Google (iOS Client ID).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plistPath = path.join(__dirname, '../app/ios/App/App/Info.plist')

if (!fs.existsSync(plistPath)) {
  console.warn('Info.plist não encontrado — pule patch iOS')
  process.exit(0)
}

const iosClientId =
  process.env.VITE_GOOGLE_IOS_CLIENT_ID ||
  process.env.GOOGLE_IOS_CLIENT_ID ||
  ''

let plist = fs.readFileSync(plistPath, 'utf8')

if (!plist.includes('NSUserNotificationsUsageDescription')) {
  plist = plist.replace(
    '<key>UIViewControllerBasedStatusBarAppearance</key>',
    `<key>NSUserNotificationsUsageDescription</key>
\t<string>O SimulaOrdem envia lembretes diários para você manter a meta de estudo.</string>
\t<key>UIViewControllerBasedStatusBarAppearance</key>`,
  )
}

if (iosClientId.includes('.apps.googleusercontent.com')) {
  const scheme = `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`

  if (!plist.includes('CFBundleURLTypes')) {
    plist = plist.replace(
      '</dict>\n</plist>',
      `\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>${scheme}</string>
\t\t\t</array>
\t\t</dict>
\t</array>
</dict>
</plist>`,
    )
    console.log('→ Info.plist: URL scheme Google adicionado')
  }
} else {
  console.warn('→ VITE_GOOGLE_IOS_CLIENT_ID não definido — crie Client ID iOS no Google Cloud (ver docs/IOS.md)')
}

fs.writeFileSync(plistPath, plist)
