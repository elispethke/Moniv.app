import { useEffect } from 'react'
import { useWalletStore } from '@/store/useWalletStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { Wallet } from '@/types/wallet'

export function useWallets() {
  const { user } = useAuthStore()
  const userId = user?.id ?? ''

  const { wallets, activeWalletId, isLoading, error, loadWallets, addWallet, updateWallet, removeWallet, setActiveWallet, getTotalBalance } = useWalletStore()

  useEffect(() => {
    if (userId) loadWallets(userId)
  }, [userId])

  return {
    wallets,
    activeWalletId,
    isLoading,
    error,
    totalBalance: getTotalBalance(),
    setActiveWallet,
    addWallet: (payload: Omit<Wallet, 'id' | 'userId'>) => addWallet(userId, payload),
    updateWallet: (id: string, fields: Partial<Pick<Wallet, 'name' | 'balance'>>) => updateWallet(id, userId, fields),
    removeWallet: (id: string) => removeWallet(id, userId),
  }
}
