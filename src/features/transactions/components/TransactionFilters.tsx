import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { TransactionFilters as Filters } from '@/types/transaction'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils/cn'

interface TransactionFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClear: () => void
}

export function TransactionFilters({ filters, onFiltersChange, onClear }: TransactionFiltersProps) {
  const { t } = useTranslation()
  const hasActiveFilters =
    Boolean(filters.type && filters.type !== 'all') || Boolean(filters.search)

  const typeOptions = [
    { value: 'all',     label: t('transactions.filter.all') },
    { value: 'income',  label: t('transactions.filter.income') },
    { value: 'expense', label: t('transactions.filter.expense') },
  ]

  return (
    <div className="space-y-3">
      <Input
        placeholder={t('transactions.filter.search_placeholder')}
        value={filters.search ?? ''}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          filters.search ? (
            <button onClick={() => onFiltersChange({ ...filters, search: '' })}>
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-2">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFiltersChange({ ...filters, type: opt.value as Filters['type'] })}
            className={cn(
              'flex-1 rounded-xl py-2 text-xs font-medium transition-all duration-200',
              (filters.type ?? 'all') === opt.value
                ? 'bg-primary text-primary-foreground shadow-glow-primary'
                : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="flex-shrink-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
