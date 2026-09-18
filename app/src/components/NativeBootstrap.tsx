import { useEffect } from 'react'
import { GoogleAuth } from '@southdevs/capacitor-google-auth'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { initNativeNotifications, syncStudyReminderNotification } from '../lib/nativeNotifications'
import { isNativeApp } from '../lib/platform'

const WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined

export default function NativeBootstrap() {
  const { progress } = useApp()

  useEffect(() => {
    if (!isNativeApp()) return

    void StatusBar.setStyle({ style: Style.Light }).catch(() => {})
    void initNativeNotifications()

    if (WEB_CLIENT_ID || IOS_CLIENT_ID) {
      GoogleAuth.initialize({
        clientId: IOS_CLIENT_ID || WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: false,
      })
    }
  }, [])

  useEffect(() => {
    if (!isNativeApp()) return
    const enabled = progress.profile?.studyReminderEnabled !== false
    void syncStudyReminderNotification(enabled)
  }, [progress.profile?.studyReminderEnabled])

  return null
}
