import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false)
  const [reload, setReload] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!import.meta.env.PROD) return

    const refresh = registerSW({
      immediate: true,
      onNeedRefresh() {
        setVisible(true)
      },
      onRegisteredSW(_url, registration) {
        if (registration) {
          window.setInterval(() => void registration.update(), 5 * 60 * 1000)
        }
      },
    })
    setReload(() => refresh)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[200] mx-auto max-w-md lg:bottom-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-white px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-ink">Nova versão disponível</p>
        <button
          type="button"
          onClick={() => void reload?.()}
          className="btn-primary shrink-0 px-4 py-2 text-xs"
        >
          Atualizar
        </button>
      </div>
    </div>
  )
}
