import { isNativeApp } from '../lib/platform'
import NativeEntry from './NativeEntry'
import Landing from '../pages/Landing'

export default function RootRoute() {
  if (isNativeApp()) return <NativeEntry />
  return <Landing />
}
