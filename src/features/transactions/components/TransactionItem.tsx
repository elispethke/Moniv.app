import { useState, useRef, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '@/types/transaction'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'

interface TransactionItemProps {
  transaction: Transaction
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export function TransactionItem({ transaction: tx, onDelete, onEdit }: TransactionItemProps) {
  const { t } = useTranslation()
  const { formatCurrency, formatDate } = useFormatters()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-surface-elevated">
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
          tx.type === 'income' ? 'bg-success/20' : 'bg-danger/20'
        )}
      >
        {tx.type === 'income' ? (
          <ArrowUpRight className="h-5 w-5 text-accent" />
        ) : (
          <ArrowDownLeft className="h-5 w-5 text-danger" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{t(`categories.${tx.category}`)}</span>
          <span className="text-xs text-surface-border">•</span>
          <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p
          className={cn(
            'text-sm font-semibold flex-shrink-0',
            tx.type === 'income' ? 'text-accent' : 'text-danger'
          )}
        >
          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
        </p>

        {/* Context menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-surface hover:text-foreground"
            aria-label="Actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-surface-border bg-surface shadow-xl">
              <button
                onClick={() => { onEdit(tx.id); setMenuOpen(false) }}
                className="flex w-full items-center gap-2.5 rounded-t-xl px-3 py-2.5 text-sm text-foreground-secondary transition-colors hover:bg-surface-elevated"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t('common.edit')}
              </button>
              <button
                onClick={() => { onDelete(tx.id); setMenuOpen(false) }}
                className="flex w-full items-center gap-2.5 rounded-b-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
