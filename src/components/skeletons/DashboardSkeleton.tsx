import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Skeleton da página Dashboard.
 * Replica a estrutura de BalanceHero + 2 SummaryCards + RecentTransactions.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-6">
      {/* ── Header greeting ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-8" rounded="lg" />
      </div>

      {/* ── BalanceHero ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-primary/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 opacity-60" rounded="full" />
          <Skeleton className="h-7 w-7 opacity-60" rounded="lg" />
        </div>
        <Skeleton className="h-9 w-36 opacity-70" />
        <Skeleton className="h-5 w-24 opacity-50" rounded="full" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary/10 p-3 space-y-2">
            <Skeleton className="h-3 w-14 opacity-40" rounded="full" />
            <Skeleton className="h-5 w-20 opacity-60" />
          </div>
          <div className="rounded-xl bg-primary/10 p-3 space-y-2">
            <Skeleton className="h-3 w-14 opacity-40" rounded="full" />
            <Skeleton className="h-5 w-20 opacity-60" />
          </div>
        </div>
      </div>

      {/* ── Period selector ───────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 flex-shrink-0" rounded="full" />
        ))}
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-surface-border bg-surface p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7" rounded="lg" />
              <Skeleton className="h-3 w-16" rounded="full" />
            </div>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20" rounded="full" />
          </div>
        ))}
      </div>

      {/* ── Chart placeholder ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full" rounded="lg" />
      </div>

      {/* ── Recent transactions ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        {[1, 2, 3, 4].map((i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3">
      <Skeleton className="h-10 w-10 flex-shrink-0" rounded="lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" rounded="full" />
      </div>
      <div className="space-y-1.5 items-end flex flex-col">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" rounded="full" />
      </div>
    </div>
  )
}
