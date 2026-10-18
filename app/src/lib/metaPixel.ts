/**
 * Meta (Facebook) Pixel + consentimento LGPD + atribuição de campanha (UTM / fbclid).
 *
 * - Só existe se VITE_META_PIXEL_ID estiver definido no build; sem ele, tudo vira no-op.
 * - Nunca carrega no app nativo (Capacitor) — só na web.
 * - Só carrega depois que o usuário aceita no aviso de cookies (padrão = sem rastreamento).
 */
import { isNativeApp } from './platform'

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: Fbq
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID ?? '').trim()
const CONSENT_KEY = 'simulaordem-consent'
const ATTRIBUTION_KEY = 'simulaordem-attribution'
const PENDING_CHECKOUT_KEY = 'simulaordem-pending-checkout'
export const CONSENT_EVENT = 'simulaordem:consent'

export type ConsentState = 'granted' | 'denied' | null

/** Pixel configurado e ambiente elegível (web). */
export function isPixelConfigured(): boolean {
  return PIXEL_ID.length > 0 && !isNativeApp()
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* modo privado / storage bloqueado */
  }
}

export function getConsent(): ConsentState {
  const v = safeGet(CONSENT_KEY)
  return v === 'granted' || v === 'denied' ? v : null
}

export function setConsent(state: 'granted' | 'denied') {
  safeSet(CONSENT_KEY, state)
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }))
  if (state === 'granted') {
    initPixel()
    trackPageView()
  }
}

function canTrack(): boolean {
  return isPixelConfigured() && getConsent() === 'granted'
}

/** Recria o cookie _fbc a partir do fbclid salvo (o consentimento pode vir depois da landing). */
function restoreFbcCookie() {
  const { fbclid, capturedAt } = getAttribution()
  if (!fbclid || document.cookie.includes('_fbc=')) return
  const ts = capturedAt ? Date.parse(capturedAt) || Date.now() : Date.now()
  const maxAge = 90 * 24 * 60 * 60
  document.cookie = `_fbc=fb.1.${ts}.${fbclid}; path=/; max-age=${maxAge}; SameSite=Lax`
}

let initialized = false

/** Snippet oficial do Meta Pixel, sem o PageView automático (o SPA dispara por rota). */
function initPixel() {
  if (initialized || !canTrack()) return
  initialized = true
  restoreFbcCookie()

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    } as Fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }
  window.fbq!('init', PIXEL_ID)
}

function fbq(...args: unknown[]) {
  if (!canTrack()) return
  initPixel()
  window.fbq?.(...args)
}

let lastPageViewPath = ''

export function trackPageView(path = window.location.pathname + window.location.search) {
  if (!canTrack()) return
  // StrictMode e reaceite de consentimento podem chamar duas vezes para a mesma rota.
  if (path === lastPageViewPath) return
  lastPageViewPath = path
  fbq('track', 'PageView')
}

/** Clique em "Começar grátis" / "Criar conta grátis". */
export function trackLead(source: string) {
  fbq('track', 'Lead', { content_name: source })
}

export function trackCompleteRegistration(method: 'email' | 'google') {
  fbq('track', 'CompleteRegistration', { content_name: method, status: true })
}

/**
 * Início do checkout Asaas. Guarda a cobrança pendente para que a página de sucesso
 * dispare Purchase uma única vez (eventID = id do checkout, para deduplicação no Meta).
 */
export function trackInitiateCheckout(plan: string, value: number | undefined) {
  const id = `chk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  safeSet(PENDING_CHECKOUT_KEY, JSON.stringify({ id, plan, value: value ?? null, ts: Date.now() }))
  fbq(
    'track',
    'InitiateCheckout',
    { content_ids: [plan], content_type: 'product', currency: 'BRL', value: value ?? 0, num_items: 1 },
    { eventID: id },
  )
}

/**
 * Chamado na página de sucesso. Só dispara se houver checkout pendente iniciado nesta
 * navegação (recarregar a página ou voltar depois não duplica a conversão).
 */
export function trackPurchaseOnce(plan: string, fallbackValue: number) {
  const raw = safeGet(PENDING_CHECKOUT_KEY)
  if (!raw) return
  let pending: { id: string; plan: string; value: number | null; ts: number }
  try {
    pending = JSON.parse(raw)
  } catch {
    safeSet(PENDING_CHECKOUT_KEY, null)
    return
  }
  // Checkout abandonado há mais de 7 dias não conta.
  if (Date.now() - pending.ts > 7 * 24 * 60 * 60 * 1000) {
    safeSet(PENDING_CHECKOUT_KEY, null)
    return
  }
  safeSet(PENDING_CHECKOUT_KEY, null)
  const value = pending.plan === plan && pending.value != null ? pending.value : fallbackValue
  fbq(
    'track',
    'Purchase',
    { content_ids: [plan], content_type: 'product', currency: 'BRL', value, num_items: 1 },
    { eventID: `purchase_${pending.id}` },
  )
}

// ---------- Atribuição (UTM / fbclid) ----------

export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  landing_path?: string
  capturedAt?: string
}

const ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const

/**
 * Lê UTM/fbclid da URL de entrada e guarda em localStorage (primeiro clique de campanha
 * vence; uma nova campanha com parâmetros substitui). Dado first-party, não vai a terceiros.
 */
export function captureAttribution(search = window.location.search) {
  const params = new URLSearchParams(search)
  const found: Attribution = {}
  for (const key of ATTRIBUTION_PARAMS) {
    const v = params.get(key)?.trim()
    if (v) found[key] = v.slice(0, 200)
  }
  if (Object.keys(found).length === 0) return
  found.landing_path = window.location.pathname
  found.capturedAt = new Date().toISOString()
  safeSet(ATTRIBUTION_KEY, JSON.stringify(found))
}

export function getAttribution(): Attribution {
  const raw = safeGet(ATTRIBUTION_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Attribution
  } catch {
    return {}
  }
}
