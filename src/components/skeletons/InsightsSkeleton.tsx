import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Skeleton da página de Insights.
 */
export function InsightsSkeleton() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-24" rounded="full" />
      </div>

      {/* Period selector */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 flex-shrink-0" rounded="full" />
        ))}
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-surface-border bg-surface p-4 space-y-2">
            <Skeleton className="h-3 w-16" rounded="full" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6 w-20" rounded="full" />
        </div>
        <Skeleton className="h-48 w-full" rounded="lg" />
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-36 w-36 flex-shrink-0" rounded="full" />
          <div className="flex-1 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 flex-shrink-0" rounded="full" />
                <Skeleton className="h-3 flex-1" rounded="full" />
                <Skeleton className="h-3 w-12 flex-shrink-0" rounded="full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-end gap-2 h-32">
          {[40, 70, 55, 90, 65, 80, 45].map((h, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} rounded="sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
