import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import type { Wallet } from '@/types/wallet'

interface AddWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (payload: Omit<Wallet, 'id' | 'userId'>) => Promise<void>
}

export function AddWalletModal({ isOpen, onClose, onAdd }: AddWalletModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('pro.wallet_form_error'))
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await onAdd({ name: name.trim(), balance: parseFloat(balance) || 0 })
      setName(''); setBalance('0')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pro.add_wallet')} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}
        <Input label={t('pro.wallet_name')} placeholder={t('pro.wallet_name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Input label={t('pro.wallet_initial_balance')} type="number" step="0.01" placeholder="0.00" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>{t('common.add')}</Button>
        </div>
      </form>
    </Modal>
  )
}
