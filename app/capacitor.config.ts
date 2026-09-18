import type { CapacitorConfig } from '@capacitor/cli'

/** Client IDs públicos — fallback se env não estiver carregado no cap sync. */
const DEFAULT_WEB_CLIENT_ID = '266921366485-92fdan4a9sqmb563ke5mdcn1prru2u1i.apps.googleusercontent.com'
const DEFAULT_IOS_CLIENT_ID = '266921366485-kius83c7a94jad7lg0dl09bhnhaj0g4m.apps.googleusercontent.com'

const webClientId =
  process.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
  process.env.GOOGLE_CLIENT_ID?.trim() ||
  DEFAULT_WEB_CLIENT_ID
const iosClientId =
  process.env.VITE_GOOGLE_IOS_CLIENT_ID?.trim() ||
  process.env.GOOGLE_IOS_CLIENT_ID?.trim() ||
  DEFAULT_IOS_CLIENT_ID

const config: CapacitorConfig = {
  appId: 'com.simulaordem.app',
  appName: 'SimulaOrdem',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  ios: {
    backgroundColor: '#f8fafb',
    contentInset: 'never',
    scrollEnabled: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email', 'openid'],
      serverClientId: webClientId,
      iosClientId,
      clientId: iosClientId,
      forceCodeForRefreshToken: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1C3F3A',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#1C3F3A',
      showSpinner: false,
    },
  },
}

export default config
