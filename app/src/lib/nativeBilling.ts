import { Browser } from '@capacitor/browser'
import { isNativeApp } from './platform'

/** Abre checkout Asaas in-app (iOS/Android) ou redireciona no browser web. */
export async function openPaymentCheckout(checkoutUrl: string): Promise<void> {
  if (!isNativeApp()) {
    window.location.href = checkoutUrl
    return
  }
  await Browser.open({
    url: checkoutUrl,
    presentationStyle: 'fullscreen',
    toolbarColor: '#1C3F3A',
  })
}

export async function closePaymentBrowser(): Promise<void> {
  if (!isNativeApp()) return
  await Browser.close().catch(() => {})
}
