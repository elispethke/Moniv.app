import { useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Block body scroll while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )
  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    // z-[200] — above everything (navbar z-40, dropdown z-50, etc.)
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">

      {/* ── Backdrop ── click/touch closes the modal */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onPointerDown={onClose}
      />

      {/* ── Panel ── flex column so header stays fixed at top while body scrolls */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          // On mobile: slides up from bottom, full width, rounded top
          // On sm+: centered card, rounded all sides
          'relative z-10 flex flex-col w-full',
          'rounded-t-3xl sm:rounded-3xl',
          'bg-surface border border-surface-border shadow-glass',
          // Max height leaves room for safe-area on iOS
          'max-h-[88vh]',
          sizeClasses[size],
        )}
        onPointerDown={(e) => e.stopPropagation()}
      >

        {/* ── Sticky header — ALWAYS visible, never scrolls away ── */}
        <div className="flex-shrink-0">
          {/* Mobile drag handle */}
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-border sm:hidden" />

          {/* Title row + X button */}
          <div className={cn(
            'flex items-center justify-between px-5 py-4',
            title && 'border-b border-surface-border',
          )}>
            {title ? (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            ) : (
              <div /> /* spacer so X aligns right */
            )}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-foreground-muted transition-colors hover:bg-surface-border hover:text-foreground active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-safe">
          {children}
        </div>

      </div>
    </div>
  )
}
