import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { usePlatformDetect } from '@/hooks/usePlatformDetect'
import { cn } from '@/utils/cn'

// ── Icons ────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

// ── Phone mockup with app UI recreation ─────────────────────────────────────

function PWAPhoneMockup() {
  return (
    <div className="relative mx-auto w-36 sm:w-44" aria-hidden>
      {/* Phone frame */}
      <div className="relative rounded-[2.4rem] border-[3px] border-white/25 bg-[#0a0a0f] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden aspect-[9/19]">

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1 bg-[#0a0a0f]">
          <span className="text-[7px] font-bold text-white/70">9:41</span>
          <div className="h-2.5 w-10 rounded-full bg-[#0a0a0f] border border-white/20" />
          <div className="flex items-end gap-[2px]">
            {[3, 5, 7, 9].map((h, i) => (
              <div key={i} className="w-[2px] rounded-full bg-white/60" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <img src="/logo.webp" alt="" className="h-4 w-4" style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.6))' }} />
            <span className="text-[8px] font-bold text-white">Moniv</span>
          </div>
          <div className="h-4 w-4 rounded-full bg-white/10 flex items-center justify-center">
            <div className="h-[5px] w-[5px] rounded-full bg-white/60" />
          </div>
        </div>

        {/* Balance card */}
        <div className="mx-2.5 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)' }}>
          <div className="px-3 pt-3 pb-3">
            <p className="text-[6px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">Saldo Total</p>
            <p className="text-[16px] font-extrabold text-white leading-none">€ 3.239<span className="text-[9px] font-bold text-white/70">,00</span></p>
            <div className="flex gap-2 mt-2.5">
              <div className="flex-1 rounded-lg bg-white/15 px-2 py-1.5">
                <p className="text-[5px] text-white/60 uppercase tracking-wide">Receitas</p>
                <p className="text-[8px] font-bold text-white mt-0.5">€ 4.800</p>
              </div>
              <div className="flex-1 rounded-lg bg-white/15 px-2 py-1.5">
                <p className="text-[5px] text-white/60 uppercase tracking-wide">Despesas</p>
                <p className="text-[8px] font-bold text-white mt-0.5">€ 1.561</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span className="text-[7px] font-bold text-white/80">Transações Recentes</span>
          <span className="text-[6px] text-white/40">Ver tudo</span>
        </div>

        {/* Transaction list */}
        {[
          { label: 'Salário', cat: 'Receita', amount: '+€ 2.400', color: '#22c55e', icon: '💼' },
          { label: 'Supermercado', cat: 'Alimentação', amount: '-€ 87', color: '#f97316', icon: '🛒' },
          { label: 'Netflix', cat: 'Lazer', amount: '-€ 15', color: '#a855f7', icon: '📺' },
          { label: 'Freelance', cat: 'Receita', amount: '+€ 600', color: '#22c55e', icon: '💻' },
        ].map((tx, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
            <div className="h-5 w-5 rounded-lg bg-white/8 flex items-center justify-center text-[8px] flex-shrink-0">
              {tx.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] font-semibold text-white truncate">{tx.label}</p>
              <p className="text-[5.5px] text-white/40">{tx.cat}</p>
            </div>
            <span className="text-[7px] font-bold flex-shrink-0" style={{ color: tx.color }}>{tx.amount}</span>
          </div>
        ))}

        {/* Bottom navigation */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-2 py-2 bg-[#0d0d14] border-t border-white/10">
          {[
            { icon: '◈', label: 'Início', active: false },
            { icon: '⟳', label: 'Transações', active: true },
            { icon: '◎', label: 'Insights', active: false },
            { icon: '⋮', label: 'Mais', active: false },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className={cn('text-[9px]', item.active ? 'text-[#818cf8]' : 'text-white/30')}>{item.icon}</span>
              <span className={cn('text-[4.5px] font-medium', item.active ? 'text-[#818cf8]' : 'text-white/30')}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glow */}
      <div className="absolute -bottom-6 left-1/2 h-12 w-28 -translate-x-1/2 rounded-full bg-primary/40 blur-2xl" />
      {/* Side reflection */}
      <div className="absolute top-8 -right-1 h-16 w-0.5 rounded-full bg-white/20" />
    </div>
  )
}

// ── iOS "Add to Home Screen" hint tooltip ────────────────────────────────────

function IOSHint({ onClose, variant }: { onClose: () => void; variant: 'landing' | 'inline' }) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const isDark = variant === 'landing'

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        'absolute z-50 w-72 rounded-2xl p-4 shadow-2xl',
        'border animate-fade-in',
        // Position: above the button on landing, below on inline
        variant === 'landing'
          ? 'bottom-full mb-3 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0'
          : 'top-full mt-2 right-0',
        isDark
          ? 'bg-[#1a1a2e] border-white/15'
          : 'bg-surface border-surface-border',
      )}
    >
      {/* Arrow */}
      <div className={cn(
        'absolute w-3 h-3 rotate-45 border',
        variant === 'landing'
          ? 'bottom-[-7px] left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 border-t-0 border-l-0 bg-[#1a1a2e] border-white/15'
          : 'top-[-7px] right-6 border-b-0 border-r-0 bg-surface border-surface-border',
      )} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-foreground')}>
          Instalar no iOS
        </p>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors',
            isDark ? 'bg-white/10 text-white/60 hover:bg-white/20' : 'bg-surface-elevated text-foreground-muted hover:bg-surface-border',
          )}
        >
          ✕
        </button>
      </div>

      {/* Steps */}
      <ol className="space-y-2">
        <li className={cn('flex items-start gap-3 text-xs', isDark ? 'text-white/80' : 'text-foreground-muted')}>
          <span className={cn(
            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
            isDark ? 'bg-white/15 text-white' : 'bg-primary/15 text-primary',
          )}>1</span>
          <span>
            Toque no ícone de partilha{' '}
            <svg className="inline h-3.5 w-3.5 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            {' '}na barra do Safari
          </span>
        </li>
        <li className={cn('flex items-start gap-3 text-xs', isDark ? 'text-white/80' : 'text-foreground-muted')}>
          <span className={cn(
            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
            isDark ? 'bg-white/15 text-white' : 'bg-primary/15 text-primary',
          )}>2</span>
          <span>Selecione <strong className={isDark ? 'text-white' : 'text-foreground'}>"Adicionar ao Ecrã de Início"</strong></span>
        </li>
      </ol>
    </div>
  )
}

// ── Install button ────────────────────────────────────────────────────────────
// Chrome/Android  → fires beforeinstallprompt native dialog
// iOS Safari      → shows a minimal "Add to Home Screen" tooltip
// Everything else → button visible, click is silent (no errors)

interface InstallButtonProps {
  t: (key: string) => string
  variant?: 'landing' | 'inline'
}

function InstallButton({ t, variant = 'landing' }: InstallButtonProps) {
  const { isInstalled, isPrompting, canInstall, promptInstall } = usePWAInstall()
  const { platform } = usePlatformDetect()
  const [showIOSHint, setShowIOSHint] = useState(false)

  if (isInstalled) {
    return (
      <div className={cn(
        'flex items-center gap-3 rounded-2xl border border-white/20 px-5 py-3 backdrop-blur-sm',
        variant === 'landing' ? 'bg-white/10' : 'bg-surface-elevated',
      )}>
        <div className="text-accent"><CheckCircleIcon /></div>
        <div>
          <p className={cn('text-sm font-bold', variant === 'landing' ? 'text-white' : 'text-foreground')}>
            {t('install_banner.installed_title')}
          </p>
          <p className={cn('text-xs', variant === 'landing' ? 'text-white/70' : 'text-foreground-muted')}>
            {t('install_banner.installed_subtitle')}
          </p>
        </div>
      </div>
    )
  }

  const handleClick = () => {
    if (canInstall) {
      // Chrome / Android: fires the real native prompt
      promptInstall()
    } else if (platform === 'ios') {
      // iOS Safari: toggle the "Add to Home Screen" hint
      setShowIOSHint(prev => !prev)
    }
    // Desktop Safari / unknown: passive — no errors, no fake behaviour
  }

  // Label adapts to platform so the button always makes sense to the user
  const buttonLabel = isPrompting
    ? t('install_banner.installing')
    : platform === 'ios' && !canInstall
      ? 'Como instalar'
      : t('install_banner.install_btn')

  if (variant === 'landing') {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={isPrompting}
          className={cn(
            'flex items-center justify-center gap-2',
            'rounded-2xl bg-white px-6 py-3',
            'text-sm font-bold text-[#4338ca]',
            'shadow-lg hover:shadow-white/30 hover:bg-white/95',
            'active:scale-[0.97] transition-all duration-150',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'min-w-[160px]',
          )}
        >
          <DownloadIcon />
          {buttonLabel}
        </button>
        {showIOSHint && (
          <IOSHint variant="landing" onClose={() => setShowIOSHint(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isPrompting}
        className={cn(
          'flex w-full sm:w-auto items-center justify-center gap-2',
          'rounded-xl bg-primary px-5 py-2.5',
          'text-sm font-bold text-primary-foreground',
          'hover:opacity-90 active:scale-[0.97] transition-all',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        <DownloadIcon />
        {buttonLabel}
      </button>
      {showIOSHint && (
        <IOSHint variant="inline" onClose={() => setShowIOSHint(false)} />
      )}
    </div>
  )
}

// ── Inline card variant (authenticated area) ─────────────────────────────────

function InlineCard({ t }: { t: (key: string) => string }) {
  const { isInstalled } = usePWAInstall()

  if (isInstalled) return null

  return (
    <div className="mx-4 sm:mx-0 mb-2">
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="rounded-[calc(1rem-1px)] bg-surface overflow-hidden">
          <div className="relative flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6">
            {/* BG decoration */}
            <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/8 blur-2xl" />

            {/* Icon + text */}
            <div className="flex flex-1 items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                <img src="/logo.webp" alt="Moniv" className="h-8 w-8" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.6))' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground leading-tight">
                  {t('install_banner.title')}
                </p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  {t('install_banner.subtitle')}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-primary/70">
                  {t('install_banner.domain')}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <InstallButton t={t} variant="inline" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface AppDownloadSectionProps {
  /**
   * landing — large full-width section for the landing page
   * inline  — compact card for the authenticated app shell
   */
  variant?: 'landing' | 'inline'
}

export function AppDownloadSection({ variant = 'landing' }: AppDownloadSectionProps) {
  const { t } = useTranslation()

  if (variant === 'inline') {
    return <InlineCard t={t} />
  }

  // ── Landing variant ─────────────────────────────────────────────────────
  return (
    <section
      aria-label={t('install_banner.title')}
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#6366f1]"
    >
      {/* Decorative layers */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:px-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                PWA · Progressive Web App
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t('install_banner.title')}
            </h2>
            <p className="mt-3 max-w-md text-base text-white/75 lg:max-w-none">
              {t('install_banner.subtitle')}
            </p>

            {/* Domain */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="font-medium">{t('install_banner.domain')}</span>
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-col items-center gap-4 lg:items-start">
              <InstallButton t={t} variant="landing" />
            </div>

            {/* Fine print */}
            <p className="mt-5 text-xs text-white/40">
              Sem App Store · Sem Google Play · Instala direto do browser
            </p>
          </div>

          {/* ── Right column: phone mockup ───────────────────────────────── */}
          <div className="hidden sm:flex flex-shrink-0 items-center justify-center lg:justify-end">
            <PWAPhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
