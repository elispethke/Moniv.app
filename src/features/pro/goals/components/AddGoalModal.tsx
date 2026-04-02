import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import type { Goal } from '@/types/goal'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (payload: Omit<Goal, 'id' | 'userId'>) => Promise<void>
}

export function AddGoalModal({ isOpen, onClose, onAdd }: AddGoalModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [deadline, setDeadline] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0 || !deadline) {
      setError(t('pro.goal_form_error'))
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await onAdd({
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline,
      })
      setName(''); setTargetAmount(''); setCurrentAmount('0'); setDeadline('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pro.add_goal')} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
        <Input label={t('pro.goal_name')} placeholder={t('pro.goal_name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
        <Input label={t('pro.goal_target')} type="number" min="0.01" step="0.01" placeholder="2000.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
        <Input label={t('pro.goal_current')} type="number" min="0" step="0.01" placeholder="0.00" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
        <Input label={t('pro.goal_deadline')} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>{t('common.add')}</Button>
        </div>
      </form>
    </Modal>
  )
}
