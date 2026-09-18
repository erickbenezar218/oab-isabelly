#!/usr/bin/env node
/**
 * Pós-sync iOS: Info.plist, URL scheme Google e GoogleAuth no capacitor.config.json.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const plistPath = path.join(root, 'app/ios/App/App/Info.plist')
const capConfigPath = path.join(root, 'app/ios/App/App/capacitor.config.json')

function loadEnv(key) {
  if (process.env[key]?.trim()) return process.env[key].trim()
  const envFile = path.join(root, '.env')
  if (!fs.existsSync(envFile)) return ''
  const line = fs.readFileSync(envFile, 'utf8').split('\n').find((l) => l.startsWith(`${key}=`))
  if (!line) return ''
  let val = line.slice(key.length + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  return val
}

const webClientId = loadEnv('VITE_GOOGLE_CLIENT_ID') || loadEnv('GOOGLE_CLIENT_ID')
const iosClientId = loadEnv('VITE_GOOGLE_IOS_CLIENT_ID') || loadEnv('GOOGLE_IOS_CLIENT_ID')

if (!fs.existsSync(plistPath)) {
  console.warn('Info.plist não encontrado — pule patch iOS')
  process.exit(0)
}

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

const appScheme = 'com.simulaordem.app'
if (!plist.includes(`<string>${appScheme}</string>`)) {
  if (plist.includes('CFBundleURLTypes')) {
    plist = plist.replace(
      /(<key>CFBundleURLTypes<\/key>\s*<array>\s*<dict>[\s\S]*?<\/dict>)(\s*<\/array>)/,
      `$1
\t\t<dict>
\t\t\t<key>CFBundleURLName</key>
\t\t\t<string>SimulaOrdem</string>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>${appScheme}</string>
\t\t\t</array>
\t\t</dict>$2`,
    )
  } else {
    plist = plist.replace(
      '</dict>\n</plist>',
      `\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLName</key>
\t\t\t<string>SimulaOrdem</string>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>${appScheme}</string>
\t\t\t</array>
\t\t</dict>
\t</array>
</dict>
</plist>`,
    )
  }
  console.log('→ Info.plist: deep link com.simulaordem.app adicionado')
}

fs.writeFileSync(plistPath, plist)

if (fs.existsSync(capConfigPath) && (webClientId || iosClientId)) {
  const cfg = JSON.parse(fs.readFileSync(capConfigPath, 'utf8'))
  cfg.plugins ??= {}
  cfg.plugins.GoogleAuth ??= {}
  cfg.plugins.GoogleAuth.scopes = ['profile', 'email', 'openid']
  if (iosClientId) cfg.plugins.GoogleAuth.iosClientId = iosClientId
  if (webClientId) cfg.plugins.GoogleAuth.serverClientId = webClientId
  cfg.plugins.GoogleAuth.clientId = iosClientId || webClientId
  cfg.plugins.GoogleAuth.forceCodeForRefreshToken = false
  cfg.plugins.SplashScreen ??= {}
  cfg.plugins.SplashScreen.backgroundColor = '#1C3F3A'
  cfg.plugins.SplashScreen.launchAutoHide = false
  cfg.plugins.SplashScreen.showSpinner = false
  cfg.ios ??= {}
  cfg.ios.backgroundColor = '#f8fafb'
  cfg.ios.contentInset = 'never'
  fs.writeFileSync(capConfigPath, `${JSON.stringify(cfg, null, '\t')}\n`)
  console.log('→ capacitor.config.json: GoogleAuth + splash atualizados')
}
