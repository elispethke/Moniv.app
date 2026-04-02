import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/transaction'
import type { RecurringTransaction } from '@/types/recurring'
import { cn } from '@/utils/cn'

interface AddRecurringModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (payload: Omit<RecurringTransaction, 'id' | 'userId'>) => Promise<void>
}

export function AddRecurringModal({ isOpen, onClose, onAdd }: AddRecurringModalProps) {
  const { t } = useTranslation()
  const today = new Date().toISOString().slice(0, 10)

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [frequency, setFrequency] = useState<'monthly' | 'weekly'>('monthly')
  const [nextDate, setNextDate] = useState(today)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoryOptions = (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => ({
    value: c.value,
    label: t(`categories.${c.value}`),
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0 || !description.trim() || !category) {
      setError(t('pro.recurring_form_error'))
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await onAdd({ type, amount: parseFloat(amount), description: description.trim(), category: category as RecurringTransaction['category'], frequency, nextDate })
      setAmount(''); setDescription(''); setCategory(''); setNextDate(today)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pro.add_recurring')} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}

        {/* Type toggle */}
        <div className="flex overflow-hidden rounded-xl border border-surface-border">
          {(['expense', 'income'] as const).map((tt) => (
            <button
              key={tt}
              type="button"
              onClick={() => { setType(tt); setCategory('') }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-all',
                type === tt
                  ? tt === 'income' ? 'border-b-2 border-accent bg-success/20 text-accent' : 'border-b-2 border-danger bg-danger/20 text-danger'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`transactions.form.${tt}`)}
            </button>
          ))}
        </div>

        <Input label={t('transactions.form.amount')} type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label={t('transactions.form.description')} placeholder={t('pro.recurring_desc_placeholder')} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Select label={t('transactions.form.category')} value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} placeholder={t('transactions.form.category_placeholder')} />
        <Select
          label={t('pro.frequency')}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'monthly' | 'weekly')}
          options={[
            { value: 'monthly', label: t('pro.monthly') },
            { value: 'weekly', label: t('pro.weekly') },
          ]}
        />
        <Input label={t('pro.next_date')} type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>{t('common.add')}</Button>
        </div>
      </form>
    </Modal>
  )
}
