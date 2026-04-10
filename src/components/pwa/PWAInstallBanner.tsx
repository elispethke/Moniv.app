import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { cn } from '@/utils/cn'

const DISMISSED_KEY = 'pwa_install_dismissed_at'
const DISMISS_DURATION_DAYS = 14 // não mostrar de novo por 14 dias

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISSED_KEY)
    if (!ts) return false
    const diff = Date.now() - Number(ts)
    return diff < DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

/**
 * Banner de instalação PWA.
 * Aparece no fundo do ecrã em dispositivos que suportam instalação.
 * Respeita um período de silêncio após o utilizador dispensar.
 */
export function PWAInstallBanner() {
  const { canInstall, isInstalled, isPrompting, promptInstall } = usePWAInstall()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (canInstall && !isInstalled && !wasDismissedRecently()) {
      // Mostrar após 30s no app para não ser intrusivo
      const t = setTimeout(() => setShow(true), 30_000)
      return () => clearTimeout(t)
    }
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch { /* ignore */ }
  }

  if (!show) return null

  return (
    <div
      role="complementary"
      aria-label="Instalar app"
      className={cn(
        'fixed bottom-20 sm:bottom-6 left-1/2 z-[9998] -translate-x-1/2',
        'w-[calc(100%-2rem)] max-w-sm',
        'rounded-2xl border border-surface-border bg-surface/95 shadow-glass backdrop-blur-md',
        'p-4',
        'animate-slide-up',
      )}
    >
      <button
        onClick={handleDismiss}
        aria-label="Fechar"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <img src="/logo.png" alt="Moniv" className="h-7 w-7 rounded-lg object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Instalar Moniv</p>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Acesso direto ao ecrã inicial, funciona offline.
          </p>
        </div>
      </div>

      <button
        onClick={handleInstall}
        disabled={isPrompting}
        className={cn(
          'mt-3 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5',
          'text-sm font-semibold text-primary-foreground',
          'flex items-center justify-center gap-2',
          'transition-opacity hover:opacity-90 active:scale-[0.98]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        <Download className="h-4 w-4" />
        {isPrompting ? 'A instalar…' : 'Instalar agora'}
      </button>
    </div>
  )
}
