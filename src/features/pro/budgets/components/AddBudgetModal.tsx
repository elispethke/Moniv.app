import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { EXPENSE_CATEGORIES } from '@/types/transaction'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (payload: { category: string; limit: number; month: string }) => Promise<void>
}

export function AddBudgetModal({ isOpen, onClose, onAdd }: AddBudgetModalProps) {
  const { t } = useTranslation()
  const thisMonth = new Date().toISOString().slice(0, 7)

  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [month, setMonth] = useState(thisMonth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !limit || parseFloat(limit) <= 0) {
      setError(t('pro.budget_form_error'))
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await onAdd({ category, limit: parseFloat(limit), month })
      setCategory('')
      setLimit('')
      setMonth(thisMonth)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({
    value: c.value,
    label: t(`categories.${c.value}`),
  }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pro.add_budget')} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
        )}

        <Select
          label={t('transactions.form.category')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
          placeholder={t('transactions.form.category_placeholder')}
        />

        <Input
          label={t('pro.budget_limit')}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="500.00"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />

        <Input
          label={t('pro.budget_month')}
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>{t('common.add')}</Button>
        </div>
      </form>
    </Modal>
  )
}
