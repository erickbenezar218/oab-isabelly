import { GoogleAuth } from '@southdevs/capacitor-google-auth'

const WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined

const DEFAULT_WEB = '266921366485-92fdan4a9sqmb563ke5mdcn1prru2u1i.apps.googleusercontent.com'
const DEFAULT_IOS = '266921366485-kius83c7a94jad7lg0dl09bhnhaj0g4m.apps.googleusercontent.com'

export const GOOGLE_WEB_CLIENT_ID = WEB_CLIENT_ID?.trim() || DEFAULT_WEB
export const GOOGLE_IOS_CLIENT_ID = IOS_CLIENT_ID?.trim() || DEFAULT_IOS

const SCOPES = ['profile', 'email', 'openid']

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

export async function nativeGoogleSignIn(): Promise<string> {
  const clientId = GOOGLE_IOS_CLIENT_ID
  const serverClientId = GOOGLE_WEB_CLIENT_ID

  if (!clientId.includes('.apps.googleusercontent.com')) {
    throw new Error('Client ID iOS inválido. Rode build-ios.sh e reinstale o app.')
  }
  if (!serverClientId.includes('.apps.googleusercontent.com')) {
    throw new Error('Client ID web inválido para Google Sign-In.')
  }

  await GoogleAuth.signOut().catch(() => {})

  await GoogleAuth.initialize({
    clientId,
    scopes: SCOPES,
    grantOfflineAccess: false,
  })

  const user = await withTimeout(
    GoogleAuth.signIn({
      scopes: SCOPES,
      clientId,
      serverClientId,
      grantOfflineAccess: false,
    }),
    90_000,
    'Google demorou demais. Tente de novo.',
  )

  const idToken = user.authentication?.idToken
  if (!idToken) {
    throw new Error('Google não retornou token. Verifique os Client IDs no Google Cloud.')
  }
  return idToken
}
