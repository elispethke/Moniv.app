import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

interface PWAInstallState {
  /** true quando o browser suporta instalação e o app ainda não está instalado */
  canInstall: boolean
  /** true quando o app já está rodando em modo standalone (já instalado) */
  isInstalled: boolean
  /** true enquanto o prompt de instalação está sendo exibido */
  isPrompting: boolean
  /** Aciona o prompt nativo de instalação */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

/**
 * Hook para gestão do ciclo de vida de instalação PWA.
 * Captura o evento `beforeinstallprompt`, expõe `canInstall` e `promptInstall`,
 * e detecta quando o app já corre em modo standalone.
 */
export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isPrompting, setIsPrompting] = useState(false)

  const isInstalled =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Limpar prompt quando a app for instalada
    const onAppInstalled = () => setDeferredPrompt(null)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'

    setIsPrompting(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return outcome
    } catch {
      return 'dismissed'
    } finally {
      setIsPrompting(false)
    }
  }, [deferredPrompt])

  return {
    canInstall: !isInstalled && deferredPrompt !== null,
    isInstalled,
    isPrompting,
    promptInstall,
  }
}
