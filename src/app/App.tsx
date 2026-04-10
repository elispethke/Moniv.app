
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './Router'
import { useAuthStore } from '@/store/useAuthStore'
import { useTransactionStore } from '@/store/useTransactionStore'
import { usePlanStore } from '@/store/usePlanStore'
import { useBudgetStore } from '@/store/useBudgetStore'
import { useGoalStore } from '@/store/useGoalStore'
import { useInstallmentStore } from '@/store/useInstallmentStore'
import { useRecurringStore } from '@/store/useRecurringStore'
import { useWalletStore } from '@/store/useWalletStore'
import { authService } from '@/services/authService'
import { checkSupabaseConnection } from '@/services/supabase'
import { useTheme } from '@/hooks/useTheme'
import { SettingsModal } from '@/features/settings/SettingsModal'
import { ProModal } from '@/components/ui/ProModal'
import { Modal } from '@/components/ui/Modal'
import { AddTransactionForm } from '@/features/transactions/components/AddTransactionForm'
import { PWAUpdateBanner } from '@/components/pwa/PWAUpdateBanner'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import { useUIStore } from '@/store/useUIStore'
import { useTranslation } from '@/hooks/useTranslation'
import type { Transaction } from '@/types/transaction'

function AppContent() {
  const { initialize, setSession } = useAuthStore()
  const { loadTransactions, reset: resetTransactions } = useTransactionStore()
  const { loadPlan, reset: resetPlan } = usePlanStore()
  const { activeModal, closeModal } = useUIStore()
  const { user } = useAuthStore()
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const { t } = useTranslation()

  useTheme()

  useEffect(() => {
    initialize()

    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setSession(session)
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user.id) {
        loadTransactions(session.user.id)
        loadPlan(session.user.id)
      }
      if (event === 'SIGNED_OUT') {
        resetTransactions()
        resetPlan()
        useBudgetStore.getState().reset()
        useGoalStore.getState().reset()
        useInstallmentStore.getState().reset()
        useRecurringStore.getState().reset()
        useWalletStore.getState().reset()
      }
    })

    checkSupabaseConnection().then((result) => {
      if (result.ok) {
        console.info('[Moniv] Supabase connected ✓')
      } else {
        console.warn('[Moniv] Supabase not available:', result.error)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialize, setSession, loadTransactions, resetTransactions, loadPlan, resetPlan])

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ambient background blobs */}
      <div aria-hidden className="pointer-events-none fixed -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <AppRouter />

      <SettingsModal />

      {/* Global add-transaction modal — available from any page */}
      {activeModal === 'add-transaction' && (
        <Modal isOpen onClose={closeModal} title={t('transactions.modal_add')}>
          <AddTransactionForm
            onSubmit={(payload: Omit<Transaction, 'id' | 'createdAt'>) =>
              addTransaction(user?.id ?? '', payload)
            }
            onCancel={closeModal}
          />
        </Modal>
      )}

      {activeModal === 'upgrade' && <ProModal onClose={closeModal} />}

      {/* PWA banners — update notification + install prompt */}
      <PWAUpdateBanner />
      <PWAInstallBanner />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
