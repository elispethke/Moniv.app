import { AlertCircle, DollarSign, FileText, Calendar, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Transaction } from '@/types/transaction'
import { useTranslation } from '@/hooks/useTranslation'
import { useTransactionForm } from '../hooks/useTransactionForm'
import { cn } from '@/utils/cn'

interface AddTransactionFormProps {
  onSubmit: (payload: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Transaction>
  isEdit?: boolean
}

export function AddTransactionForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: AddTransactionFormProps) {
  const { t } = useTranslation()
  const {
    type,
    setType,
    amount,
    setAmount,
    description,
    setDescription,
    category,
    setCategory,
    categoryAutoDetected,
    date,
    setDate,
    categories,
    fieldErrors,
    apiError,
    isLoading,
    handleSubmit,
  } = useTransactionForm({ onSubmit, onSuccess: onCancel, initialData })

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Income / Expense toggle */}
      <div className="flex overflow-hidden rounded-xl border border-surface-border">
        {(['expense', 'income'] as const).map((transType) => (
          <button
            key={transType}
            type="button"
            onClick={() => setType(transType)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-all duration-200',
              type === transType
                ? transType === 'income'
                  ? 'border-b-2 border-accent bg-success/20 text-accent'
                  : 'border-b-2 border-danger bg-danger/20 text-danger'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {transType === 'income' ? t('transactions.form.income') : t('transactions.form.expense')}
          </button>
        ))}
      </div>

      <Input
        label={t('transactions.form.amount')}
        type="number"
        min="0.01"
        step="0.01"
        placeholder={t('transactions.form.amount_placeholder')}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        leftIcon={<DollarSign className="h-4 w-4" />}
        error={fieldErrors.amount}
      />

      <Input
        label={t('transactions.form.description')}
        placeholder={t('transactions.form.description_placeholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        leftIcon={<FileText className="h-4 w-4" />}
        error={fieldErrors.description}
      />

      <div className="relative">
        <Select
          label={t('transactions.form.category')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categories}
          placeholder={t('transactions.form.category_placeholder')}
          error={fieldErrors.category}
        />
        {categoryAutoDetected && (
          <span className={cn(
            'absolute right-8 top-[2.1rem] flex items-center gap-1',
            'text-[10px] font-semibold text-primary pointer-events-none',
          )}>
            <Sparkles className="h-2.5 w-2.5" />
            sugerido
          </span>
        )}
      </div>

      <Input
        label={t('transactions.form.date')}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        leftIcon={<Calendar className="h-4 w-4" />}
        error={fieldErrors.date}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" fullWidth onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant={type === 'income' ? 'accent' : 'primary'}
          fullWidth
          isLoading={isLoading}
        >
          {isEdit ? t('transactions.form.save_button') : t('transactions.form.add_button')}
        </Button>
      </div>
    </form>
  )
}
