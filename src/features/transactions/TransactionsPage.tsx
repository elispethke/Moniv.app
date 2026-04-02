import { useState } from 'react'
import { Plus, AlertCircle, RefreshCw, Download } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { TransactionItem } from './components/TransactionItem'
import { TransactionFilters } from './components/TransactionFilters'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useTransactions } from '@/hooks/useTransactions'
import { useUIStore } from '@/store/useUIStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { FEATURES } from '@/lib/features'
import { exportService } from '@/services/exportService'
import { useTransactionStore } from '@/store/useTransactionStore'
import { AddTransactionForm } from './components/AddTransactionForm'
import type { Transaction } from '@/types/transaction'

export function TransactionsPage() {
  const {
    filteredTransactions,
    filters,
    isLoading,
    error,
    setFilters,
    clearFilters,
    updateTransaction,
    removeTransaction,
    reload,
  } = useTransactions()

  const { activeModal, selectedTransactionId, openModal, closeModal } = useUIStore()
  const { t } = useTranslation()
  const canExport = useFeatureAccess(FEATURES.EXPORT)
  const allTransactions = useTransactionStore((s) => s.transactions)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedTransaction = selectedTransactionId
    ? filteredTransactions.find((tx) => tx.id === selectedTransactionId)
    : undefined

  const handleDelete = (id: string) => {
    setDeleteId(id)
    openModal('delete-confirm', id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await removeTransaction(deleteId)
      closeModal()
      setDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageLayout
      title={t('transactions.title')}
      subtitle={t('transactions.subtitle')}
      action={
        <div className="flex items-center gap-2">
          {canExport && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportService.downloadTransactionsCsv(allTransactions)}
              title={t('pro.export_csv')}
            >
              <Download className="h-4 w-4" />
              {t('pro.export_csv')}
            </Button>
          )}
          <Button size="sm" onClick={() => openModal('add-transaction')}>
            <Plus className="h-4 w-4" />
            {t('transactions.add_button')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <TransactionFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={clearFilters}
        />

        <Card>
          <CardBody className="p-2">
            {error && !isLoading && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <AlertCircle className="h-8 w-8 text-danger" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={reload}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t('common.retry')}
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="space-y-1 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-xl bg-surface-elevated" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-surface-elevated" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-elevated" />
                    </div>
                    <div className="h-3 w-16 animate-pulse rounded bg-surface-elevated" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredTransactions.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">{t('transactions.empty')}</p>
                <Button
                  variant="ghost"
                  className="mt-3 text-primary"
                  onClick={() => openModal('add-transaction')}
                >
                  {t('transactions.add_first')}
                </Button>
              </div>
            )}

            {!isLoading && !error && filteredTransactions.length > 0 &&
              filteredTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onDelete={handleDelete}
                  onEdit={(id) => openModal('edit-transaction', id)}
                />
              ))
            }
          </CardBody>
        </Card>
      </div>

      {/* add-transaction modal is rendered globally in App.tsx */}

      <Modal
        isOpen={activeModal === 'edit-transaction' && !!selectedTransaction}
        onClose={closeModal}
        title={t('transactions.modal_edit')}
      >
        {selectedTransaction && (
          <AddTransactionForm
            onSubmit={(payload: Omit<Transaction, 'id' | 'createdAt'>) => updateTransaction(selectedTransaction.id, payload)}
            onCancel={closeModal}
            initialData={selectedTransaction}
            isEdit
          />
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'delete-confirm'}
        onClose={closeModal}
        title={t('transactions.modal_delete')}
        size="sm"
      >
        <p className="mb-5 text-sm text-foreground-secondary">
          {t('transactions.delete_message')}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" fullWidth isLoading={isDeleting} onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </PageLayout>
  )
}
