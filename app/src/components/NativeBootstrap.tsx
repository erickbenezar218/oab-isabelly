import { SplashScreen } from '@capacitor/splash-screen'
import { useEffect } from 'react'
import { GoogleAuth } from '@southdevs/capacitor-google-auth'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useApp } from '../context/AppContext'
import { initNativeNotifications, syncStudyReminderNotification } from '../lib/nativeNotifications'
import { isNativeApp } from '../lib/platform'

const WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined

export default function NativeBootstrap() {
  const { progress } = useApp()

  useEffect(() => {
    if (!isNativeApp()) return

    void (async () => {
      await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      await initNativeNotifications()

      const clientId = IOS_CLIENT_ID || WEB_CLIENT_ID
      if (clientId) {
        await GoogleAuth.initialize({
          clientId,
          scopes: ['profile', 'email', 'openid'],
          grantOfflineAccess: false,
        }).catch(() => {})
      }

      await SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {})
    })()
  }, [])

  useEffect(() => {
    if (!isNativeApp()) return
    const enabled = progress.profile?.studyReminderEnabled !== false
    void syncStudyReminderNotification(enabled)
  }, [progress.profile?.studyReminderEnabled])

  return null
}
