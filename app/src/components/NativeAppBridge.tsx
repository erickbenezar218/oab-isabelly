import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pathFromAppUrl } from '../lib/deepLink'
import { closePaymentBrowser } from '../lib/nativeBilling'
import { isNativeApp } from '../lib/platform'
import { useAuth } from '../context/AuthContext'

/** Deep links + refresh de plano ao voltar do Asaas ou reabrir o app. */
export default function NativeAppBridge() {
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  useEffect(() => {
    if (!isNativeApp()) return

    const go = (url: string) => {
      const path = pathFromAppUrl(url)
      if (!path) return
      void closePaymentBrowser()
      void refreshSession()
      navigate(path, { replace: true })
    }

    const launch = App.getLaunchUrl().then((result) => {
      if (result?.url) go(result.url)
    })

    const openSub = App.addListener('appUrlOpen', ({ url }) => go(url))

    const resumeSub = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void refreshSession()
    })

    const browserSub = Browser.addListener('browserFinished', () => {
      void refreshSession()
    })

    return () => {
      void launch
      void openSub.then((h) => h.remove())
      void resumeSub.then((h) => h.remove())
      void browserSub.then((h) => h.remove())
    }
  }, [navigate, refreshSession])

  return null
}
