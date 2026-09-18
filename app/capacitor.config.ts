import type { CapacitorConfig } from '@capacitor/cli'

const webClientId = process.env.VITE_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? ''
const iosClientId = process.env.VITE_GOOGLE_IOS_CLIENT_ID ?? process.env.GOOGLE_IOS_CLIENT_ID ?? ''

const config: CapacitorConfig = {
  appId: 'com.simulaordem.app',
  appName: 'SimulaOrdem',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: webClientId || undefined,
      iosClientId: iosClientId || undefined,
      clientId: iosClientId || webClientId || undefined,
      forceCodeForRefreshToken: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1C3F3A',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#1C3F3A',
      showSpinner: false,
    },
  },
}

export default config
