import type { CategoryTotal } from '@/types/transaction'
import { useFormatters } from '@/hooks/useFormatters'
import { useTranslation } from '@/hooks/useTranslation'
import { CHART_COLORS } from './ExpensePieChart'

interface CategoryBreakdownProps {
  data: CategoryTotal[]
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()

  if (!data.length) return null

  const top = data.slice(0, 6)

  return (
    <div className="space-y-3">
      {top.map((entry, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length]
        return (
          <div key={entry.category} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-xs font-medium text-foreground">
                  {t(`categories.${entry.category}`)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold tabular-nums text-foreground">
                  {formatCurrency(entry.total)}
                </span>
                <span className="w-9 text-right text-[10px] tabular-nums text-muted-foreground">
                  {entry.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(entry.percentage, 100)}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 6px 0 ${color}55`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
