import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import type { Goal } from '@/types/goal'

interface DepositModalProps {
  isOpen: boolean
  goal: Goal | null
  onClose: () => void
  onDeposit: (goalId: string, amount: number) => Promise<void>
}

export function DepositModal({ isOpen, goal, onClose, onDeposit }: DepositModalProps) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal || !amount || parseFloat(amount) <= 0) return
    setIsLoading(true)
    try {
      await onDeposit(goal.id, parseFloat(amount))
      setAmount('')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pro.goal_add_deposit')} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-foreground-secondary">{goal?.name}</p>
        <Input
          label={t('pro.deposit_amount')}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>{t('pro.deposit_confirm')}</Button>
        </div>
      </form>
    </Modal>
  )
}
