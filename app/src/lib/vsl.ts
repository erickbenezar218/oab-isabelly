/** VSL oficial (YouTube). Override: VITE_VSL_EMBED_URL no build. */
export const DEFAULT_VSL_WATCH_URL = 'https://youtu.be/4TuWaZoP-TI'

/** URL de embed (YouTube / Vimeo / HeyGen). Aceita link watch ou embed direto. */
export function vslEmbedSrc(): string | null {
  const raw =
    (import.meta.env.VITE_VSL_EMBED_URL as string | undefined)?.trim() || DEFAULT_VSL_WATCH_URL
  if (raw === 'off' || raw === 'false') return null

  try {
    if (raw.includes('youtube.com/watch')) {
      const id = new URL(raw).searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
    }
    if (raw.includes('youtu.be/')) {
      const id = raw.split('youtu.be/')[1]?.split(/[?&]/)[0]
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
    }
  } catch {
    return null
  }

  return raw
}

export function isVslConfigured(): boolean {
  return Boolean(vslEmbedSrc())
}

export function vslIsPortrait(): boolean {
  return (import.meta.env.VITE_VSL_ASPECT as string | undefined)?.trim().toLowerCase() === 'portrait'
}
