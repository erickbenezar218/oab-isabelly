/** VSL oficial (YouTube Short). Override: VITE_VSL_EMBED_URL no build. */
export const DEFAULT_VSL_WATCH_URL = 'https://www.youtube.com/shorts/VSWAhgEwFQo'

function youtubeEmbedId(raw: string): string | null {
  if (raw.includes('youtube.com/watch')) {
    const id = new URL(raw).searchParams.get('v')
    return id || null
  }
  if (raw.includes('youtube.com/shorts/')) {
    return raw.split('/shorts/')[1]?.split(/[?&/]/)[0] ?? null
  }
  if (raw.includes('youtu.be/')) {
    return raw.split('youtu.be/')[1]?.split(/[?&]/)[0] ?? null
  }
  return null
}

/** URL de embed (YouTube / Vimeo / HeyGen). Aceita watch, Shorts, youtu.be ou embed direto. */
export function vslEmbedSrc(): string | null {
  const raw =
    (import.meta.env.VITE_VSL_EMBED_URL as string | undefined)?.trim() || DEFAULT_VSL_WATCH_URL
  if (raw === 'off' || raw === 'false') return null

  try {
    const id = youtubeEmbedId(raw)
    if (id) return `https://www.youtube.com/embed/${id}?rel=0`
  } catch {
    return null
  }

  return raw
}

export function isVslConfigured(): boolean {
  return Boolean(vslEmbedSrc())
}

export function vslIsPortrait(): boolean {
  const aspect = (import.meta.env.VITE_VSL_ASPECT as string | undefined)?.trim().toLowerCase()
  if (aspect === 'portrait') return true
  if (aspect === 'landscape') return false
  const raw =
    (import.meta.env.VITE_VSL_EMBED_URL as string | undefined)?.trim() || DEFAULT_VSL_WATCH_URL
  return raw.includes('/shorts/')
}
