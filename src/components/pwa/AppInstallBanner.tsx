import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'

const DISMISSED_KEY = 'app_install_banner_dismissed'

// Placeholder store links — substituir pelos links reais quando as apps forem publicadas
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=app.moniv'
const APP_STORE_URL   = 'https://apps.apple.com/app/moniv/id0000000000'

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor" aria-hidden>
      <path d="M3.18 23.76a2 2 0 0 0 2.18-.26L17 13 5.36.5A2 2 0 0 0 3 2.24v19.52a2 2 0 0 0 .18 2zM19.39 10.48l-2.79-1.6-3.27 3.12 3.27 3.12 2.8-1.6A2 2 0 0 0 19.39 10.48zM5.36 23.5 17 13 5.36.5" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

/**
 * Banner de instalação global — aparece em todas as páginas (autenticadas e públicas).
 * Persiste até o utilizador fechar (guarda no localStorage).
 * Inclui botões para Google Play e App Store.
 */
export function AppInstallBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISSED_KEY)) {
        // Pequeno delay para não flashar durante o carregamento inicial
        const timer = setTimeout(() => setVisible(true), 300)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage pode não estar disponível (modo privado restrito)
    }
  }, [])

  const handleDismiss = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      try { localStorage.setItem(DISMISSED_KEY, '1') } catch { /* ignore */ }
    }, 250)
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      aria-label={t('install_banner.title')}
      className={cn(
        'relative w-full z-50',
        'transition-all duration-300',
        closing ? 'opacity-0 -translate-y-2 max-h-0 overflow-hidden' : 'opacity-100 translate-y-0',
      )}
    >
      {/* ── Gradient background ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#4f46e5]">
        {/* Decorative blobs — purely visual */}
        <div aria-hidden className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -right-4 bottom-0 h-20 w-32 rounded-full bg-secondary/30 blur-2xl" />

        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6">

          {/* ── Left: logo + copy ──────────────────────────────────────────── */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
              <img
                src="/logo.png"
                alt="Moniv"
                className="h-6 w-6 rounded-lg object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-white">
                {t('install_banner.title')}
              </p>
              <p className="hidden text-xs text-white/70 sm:block">
                {t('install_banner.subtitle')}
              </p>
            </div>
          </div>

          {/* ── Center: store buttons ──────────────────────────────────────── */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5',
                'bg-white/15 hover:bg-white/25 active:scale-[0.97]',
                'border border-white/20 backdrop-blur-sm',
                'text-xs font-semibold text-white',
                'transition-all duration-150',
                'whitespace-nowrap',
              )}
              aria-label="Google Play"
            >
              <GooglePlayIcon />
              <span className="hidden xs:inline sm:inline">{t('install_banner.google_play')}</span>
              <span className="xs:hidden sm:hidden">Play</span>
            </a>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5',
                'bg-white text-[#4f46e5] hover:bg-white/90 active:scale-[0.97]',
                'border border-white/20',
                'text-xs font-semibold',
                'transition-all duration-150',
                'whitespace-nowrap shadow-sm',
              )}
              aria-label="App Store"
            >
              <AppleIcon />
              <span className="hidden xs:inline sm:inline">{t('install_banner.app_store')}</span>
              <span className="xs:hidden sm:hidden">iOS</span>
            </a>
          </div>

          {/* ── Right: dismiss ─────────────────────────────────────────────── */}
          <button
            onClick={handleDismiss}
            aria-label={t('install_banner.dismiss')}
            className={cn(
              'ml-auto flex-shrink-0',
              'flex h-7 w-7 items-center justify-center rounded-lg',
              'text-white/70 hover:text-white hover:bg-white/15',
              'transition-colors',
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom shadow to separate from content below */}
      <div aria-hidden className="h-px bg-white/10" />
    </div>
  )
}
