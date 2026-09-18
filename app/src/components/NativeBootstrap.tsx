import { SplashScreen } from '@capacitor/splash-screen'
import { useEffect } from 'react'
import { GoogleAuth } from '@southdevs/capacitor-google-auth'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useApp } from '../context/AppContext'
import { GOOGLE_IOS_CLIENT_ID } from '../lib/googleNativeAuth'
import { initNativeNotifications, syncStudyReminderNotification } from '../lib/nativeNotifications'
import { isNativeApp } from '../lib/platform'

export default function NativeBootstrap() {
  const { progress } = useApp()

  useEffect(() => {
    if (!isNativeApp()) return

    void (async () => {
      await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      await initNativeNotifications()

      await GoogleAuth.initialize({
        clientId: GOOGLE_IOS_CLIENT_ID,
        scopes: ['profile', 'email', 'openid'],
        grantOfflineAccess: false,
      }).catch(() => {})

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
