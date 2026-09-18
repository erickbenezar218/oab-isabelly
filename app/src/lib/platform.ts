import { Capacitor } from '@capacitor/core'

export function isNativeApp() {
  return Capacitor.isNativePlatform()
}

export function isIOSNative() {
  return Capacitor.getPlatform() === 'ios'
}
