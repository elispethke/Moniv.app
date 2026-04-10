import { Skeleton } from '@/components/ui/Skeleton'
import { TransactionRowSkeleton } from './DashboardSkeleton'

/**
 * Skeleton da página de Transações.
 */
export function TransactionsSkeleton() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-28" rounded="lg" />
      </div>

      {/* Search / filter bar */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" rounded="lg" />
        <Skeleton className="h-10 w-10" rounded="lg" />
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 flex-shrink-0" rounded="full" />
        ))}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-surface-border bg-surface p-3 space-y-1.5">
            <Skeleton className="h-3 w-12" rounded="full" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-1">
        {/* Date group header */}
        <Skeleton className="h-3 w-20 mb-2" rounded="full" />
        {[1, 2, 3].map((i) => (
          <TransactionRowSkeleton key={`a-${i}`} />
        ))}
        <Skeleton className="h-3 w-20 my-2" rounded="full" />
        {[1, 2, 3].map((i) => (
          <TransactionRowSkeleton key={`b-${i}`} />
        ))}
      </div>
    </div>
  )
}
