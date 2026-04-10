import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { cn } from '@/utils/cn'

/**
 * Banner de atualização do service worker.
 * Aparece discretamente no topo quando uma nova versão está disponível.
 * O utilizador escolhe actualizar agora ou ignorar.
 */
export function PWAUpdateBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Verificar actualizações a cada 60 minutos
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service worker registration error:', error)
    },
  })

  useEffect(() => {
    if (needRefresh && !dismissed) {
      // Pequeno delay para não aparecer imediatamente ao carregar
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [needRefresh, dismissed])

  const handleUpdate = useCallback(async () => {
    setVisible(false)
    await updateServiceWorker(true)
  }, [updateServiceWorker])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed top-4 left-1/2 z-[9999] -translate-x-1/2',
        'w-[calc(100%-2rem)] max-w-sm',
        'rounded-2xl border border-primary/30 bg-surface/95 shadow-glass backdrop-blur-md',
        'px-4 py-3',
        'flex items-center gap-3',
        'animate-slide-down',
      )}
    >
      {/* Ícone */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
        <RefreshCw className="h-4 w-4 text-primary" />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">Nova versão disponível</p>
        <p className="text-xs text-foreground-muted leading-tight mt-0.5">Actualizar para obter as últimas melhorias.</p>
      </div>

      {/* Acções */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleUpdate}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.97]"
        >
          Actualizar
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Ignorar actualização"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
