import { isNativeApp } from './platform'

declare const __APP_VERSION__: string
declare const __APP_BUILD__: string

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'
export const APP_BUILD = typeof __APP_BUILD__ !== 'undefined' ? __APP_BUILD__ : ''

export function appVersionLabel(): string {
  const platform = isNativeApp() ? 'app iOS' : 'web'
  const build = APP_BUILD ? ` · ${APP_BUILD}` : ''
  return `SimulaOrdem ${platform} · v${APP_VERSION}${build}`
}
