import { useState, useRef } from 'react'
import type { FormEvent } from 'react'
import type { Transaction, TransactionCategory, TransactionType } from '@/types/transaction'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types/transaction'
import { useSettingsStore } from '@/store/useSettingsStore'
import { createTranslator } from '@/i18n'
import { detectCategory } from '@/utils/autoCategoryDetect'

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

  const [type, setTypeRaw] = useState<TransactionType>(initialData?.type ?? 'expense')
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '')
  const [description, setDescriptionRaw] = useState(initialData?.description ?? '')
  const [category, setCategoryRaw] = useState(initialData?.category ?? '')
  const [categoryAutoDetected, setCategoryAutoDetected] = useState(false)
  const [date, setDate] = useState(
    initialData?.date
      ? initialData.date.split('T')[0]
      : new Date().toISOString().split('T')[0]
  )

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // true once the user has manually picked a category — disables auto-detect
  const userPickedCategory = useRef(!!initialData?.category)

  // Build translated option lists
  const categories = (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => ({
    value: c.value,
    label: t(`categories.${c.value}`),
  }))

  // Exposed setType: resets category when switching income ↔ expense
  function setType(newType: TransactionType) {
    setTypeRaw(newType)
    setCategoryRaw('')
    setCategoryAutoDetected(false)
    userPickedCategory.current = false
  }

  // Exposed setCategory: marks that the user has manually chosen
  function setCategory(val: string) {
    userPickedCategory.current = true
    setCategoryAutoDetected(false)
    setCategoryRaw(val)
  }

  // Exposed setDescription: runs auto-detect after every keystroke
  function setDescription(val: string) {
    setDescriptionRaw(val)
    if (userPickedCategory.current) return

    const detected = detectCategory(val, type)
    if (detected) {
      setCategoryRaw(detected)
      setCategoryAutoDetected(true)
    } else if (categoryAutoDetected) {
      // Previously auto-detected but description no longer matches — clear
      setCategoryRaw('')
      setCategoryAutoDetected(false)
    }
  }

  const validate = (): boolean => {
    const errs: FieldErrors = {}
    if (!amount || parseFloat(amount) <= 0) errs.amount      = t('transactions.errors.amount')
    if (!description.trim())               errs.description  = t('transactions.errors.description')
    if (!category)                         errs.category     = t('transactions.errors.category')
    if (!date)                             errs.date         = t('transactions.errors.date')
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
    categoryAutoDetected,
    date, setDate,
    categories,
    fieldErrors,
    apiError,
    isLoading,
    handleSubmit,
  }
}
