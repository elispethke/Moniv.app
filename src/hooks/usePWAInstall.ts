import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

// Referência ao objeto global capturado antes do React montar (ver index.html).
function getGlobalPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === 'undefined') return null
  return (window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent | null })
    .__pwaInstallPrompt ?? null
}

function getIsInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

interface PWAInstallState {
  canInstall: boolean
  isInstalled: boolean
  isPrompting: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

export function usePWAInstall(): PWAInstallState {
  // Inicializa já com o prompt capturado pelo script inline no index.html.
  // Se o evento ainda não disparou, será null — o listener abaixo trata esse caso.
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(getGlobalPrompt)
  const [isInstalled, setIsInstalled] = useState<boolean>(getIsInstalled)
  const [isPrompting, setIsPrompting] = useState(false)

  useEffect(() => {
    // Garante que apanhamos o prompt mesmo que o useEffect corra depois do evento.
    const globalPrompt = getGlobalPrompt()
    if (globalPrompt && !deferredPrompt) {
      setDeferredPrompt(globalPrompt)
    }

    // Ouve o evento customizado disparado pelo script inline quando o prompt chega.
    const onPromptReady = () => {
      const p = getGlobalPrompt()
      if (p) setDeferredPrompt(p)
    }

    // Ouve o evento nativo também (caso o React monte antes do evento disparar).
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      const prompt = e as BeforeInstallPromptEvent
      ;(window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent | null })
        .__pwaInstallPrompt = prompt
      setDeferredPrompt(prompt)
    }

    const onAppInstalled = () => {
      ;(window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent | null })
        .__pwaInstallPrompt = null
      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('pwa-prompt-ready', onPromptReady)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('pwa-app-installed', onAppInstalled)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('pwa-prompt-ready', onPromptReady)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('pwa-app-installed', onAppInstalled)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const prompt = deferredPrompt ?? getGlobalPrompt()
    if (!prompt) return 'unavailable'

    setIsPrompting(true)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      // Após usar o prompt ele fica inválido — limpar.
      ;(window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent | null })
        .__pwaInstallPrompt = null
      setDeferredPrompt(null)
      if (outcome === 'accepted') setIsInstalled(true)
      return outcome
    } catch {
      return 'dismissed'
    } finally {
      setIsPrompting(false)
    }
  }, [deferredPrompt])

  return {
    canInstall: !isInstalled && (deferredPrompt !== null || getGlobalPrompt() !== null),
    isInstalled,
    isPrompting,
    promptInstall,
  }
}
