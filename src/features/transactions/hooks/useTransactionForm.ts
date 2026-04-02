import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/transaction'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/transaction'
import { useSettingsStore } from '@/store/useSettingsStore'
import { createTranslator } from '@/i18n'

interface UseTransactionFormProps {
  onSubmit: (payload: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  onSuccess: () => void
  initialData?: Partial<Transaction>
}

type FieldErrors = Partial<Record<'amount' | 'description' | 'category' | 'date', string>>

export function useTransactionForm({
  onSubmit,
  onSuccess,
  initialData,
}: UseTransactionFormProps) {
  const language = useSettingsStore((s) => s.language)
  const t = createTranslator(language)

  const [type, setTypeState] = useState<TransactionType>(initialData?.type ?? 'expense')
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [date, setDate] = useState(
    initialData?.date
      ? initialData.date.split('T')[0]
      : new Date().toISOString().split('T')[0]
  )

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Build translated option lists
  const categories = (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => ({
    value: c.value,
    label: t(`categories.${c.value}`),
  }))

  const setType = (newType: TransactionType) => {
    setTypeState(newType)
    setCategory('')
  }

  const validate = (): boolean => {
    const errs: FieldErrors = {}
    if (!amount || parseFloat(amount) <= 0) errs.amount    = t('transactions.errors.amount')
    if (!description.trim())               errs.description = t('transactions.errors.description')
    if (!category)                         errs.category    = t('transactions.errors.category')
    if (!date)                             errs.date        = t('transactions.errors.date')
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setApiError(null)

    try {
      await onSubmit({
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        category: category as TransactionCategory,
        date,
      })
      onSuccess()
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : t('transactions.errors.save')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    type, setType,
    amount, setAmount,
    description, setDescription,
    category, setCategory,
    date, setDate,
    categories,
    fieldErrors,
    apiError,
    isLoading,
    handleSubmit,
  }
}
