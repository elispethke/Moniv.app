import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { useFormatters } from '@/hooks/useFormatters'
import type { Installment } from '@/types/installment'

interface AddInstallmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (payload: Omit<Installment, 'id' | 'userId'>) => Promise<void>
}

export function AddInstallmentModal({ isOpen, onClose, onAdd }: AddInstallmentModalProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const today = new Date().toISOString().slice(0, 10)

  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [totalInstallments, setTotalInstallments] = useState('12')
  const [startDate, setStartDate] = useState(today)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const perInstallment = totalAmount && totalInstallments
    ? parseFloat(totalAmount) / parseInt(totalInstallments)
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !totalAmount || parseFloat(totalAmount) <= 0 || parseInt(totalInstallments) < 2) {
      setError(t('pro.installment_form_error'))
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await onAdd({
        description: description.trim(),
        totalAmount: parseFloat(totalAmount),
        totalInstallments: parseInt(totalInstallments),
        startDate,
      })
      setDescription(''); setTotalAmount(''); setTotalInstallments('12'); setStartDate(today)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pro.add_installment')} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
        <Input label={t('transactions.form.description')} placeholder={t('pro.installment_desc_placeholder')} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label={t('pro.installment_total')} type="number" min="0.01" step="0.01" placeholder="1200.00" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
        <Input label={t('pro.installment_count')} type="number" min="2" max="60" step="1" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} />
        <Input label={t('pro.installment_start')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        {perInstallment !== null && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
            {t('pro.installment_per_month')}: <span className="font-bold">{formatCurrency(perInstallment)}/mês</span>
          </p>
        )}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>{t('common.add')}</Button>
        </div>
      </form>
    </Modal>
  )
}
