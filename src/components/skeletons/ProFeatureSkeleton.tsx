import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Skeleton genérico para as páginas Pro (Budgets, Goals, Installments, etc.).
 * Replica um layout de lista de cards com botão de adicionar.
 */
export function ProFeatureSkeleton() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-48" rounded="full" />
        </div>
        <Skeleton className="h-9 w-28" rounded="lg" />
      </div>

      {/* Summary banner */}
      <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5 text-center">
              <Skeleton className="h-3 w-14 mx-auto" rounded="full" />
              <Skeleton className="h-5 w-20 mx-auto" />
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full" rounded="full" />
      </div>

      {/* Card list */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" rounded="lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" rounded="full" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-2 w-full" rounded="full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" rounded="full" />
            <Skeleton className="h-3 w-24" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  )
}
