import { useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // onPointerDown on the outer layer: fires for both mouse AND touch on all browsers
      // including iOS Safari. We only close when the click is on the overlay itself,
      // not on the modal panel (panel calls e.stopPropagation).
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop — visual only; pointer events handled on parent */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        // onPointerDown here as well so clicking the backdrop itself also closes
        onPointerDown={onClose}
      />

      {/* Modal panel — stop propagation so clicks inside don't reach the overlay */}
      <div
        className={cn(
          'relative z-10 w-full rounded-t-3xl sm:rounded-3xl bg-surface border border-surface-border shadow-glass',
          'animate-slide-up max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
        )}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Handle bar — mobile drag affordance */}
        <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-surface-border sm:hidden" />

        {/* Header: title + X button always present */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4',
            title ? 'border-b border-surface-border' : 'absolute right-0 top-0 z-10 p-3',
          )}
        >
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
            className={cn(!title && 'bg-surface-elevated/80 backdrop-blur-sm')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className={cn('p-5 pb-safe', title && 'pt-5')}>{children}</div>
      </div>
    </div>
  )
}
