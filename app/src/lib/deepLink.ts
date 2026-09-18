/** Deep link custom scheme — com.simulaordem.app://planos/sucesso?plan=pro */
export const APP_URL_SCHEME = 'com.simulaordem.app'

export function appDeepLink(path: string): string {
  const clean = path.startsWith('/') ? path.slice(1) : path
  return `${APP_URL_SCHEME}://${clean}`
}

/** Converte deep link ou URL relativa em path do React Router. */
export function pathFromAppUrl(url: string): string | null {
  const schemePrefix = `${APP_URL_SCHEME}://`
  if (url.startsWith(schemePrefix)) {
    const rest = url.slice(schemePrefix.length)
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'simulaordem.com.br' || parsed.hostname === 'www.simulaordem.com.br') {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  } catch {
    /* ignore */
  }
  return null
}
