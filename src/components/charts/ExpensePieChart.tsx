import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryTotal } from '@/types/transaction'
import { useFormatters } from '@/hooks/useFormatters'
import { useChartTheme } from '@/hooks/useChartTheme'
import { useTranslation } from '@/hooks/useTranslation'

interface ExpensePieChartProps {
  data: CategoryTotal[]
}

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16',
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategoryTotal }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()
  const { formatCurrency, formatPercentage } = useFormatters()
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-2xl border px-3.5 py-3 shadow-glass text-xs"
      style={{ background: ct.tooltipBg, borderColor: ct.tooltipBorder }}
    >
      <p className="font-semibold mb-1" style={{ color: ct.tooltipText }}>
        {t(`categories.${item.name}`)}
      </p>
      <p className="font-bold text-sm" style={{ color: ct.tooltipText }}>
        {formatCurrency(item.value)}
      </p>
      <p className="mt-0.5" style={{ color: ct.tooltipMuted }}>
        {formatPercentage(item.payload.percentage)}
      </p>
    </div>
  )
}

function CenterLabel({
  viewBox,
  top,
  total,
  textColor,
  mutedColor,
}: {
  viewBox?: { cx: number; cy: number }
  top: CategoryTotal | undefined
  total: number
  textColor: string
  mutedColor: string
}) {
  const { formatCompactNumber } = useFormatters()
  if (!viewBox) return null
  const { cx, cy } = viewBox
  const pct = top ? top.percentage.toFixed(0) : '0'
  return (
    <g>
      <text x={cx} y={cy - 14} textAnchor="middle" fill={mutedColor} fontSize={9} fontWeight={500} letterSpacing={1}>
        TOTAL
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill={textColor} fontSize={16} fontWeight={800}>
        {formatCompactNumber(total)}
      </text>
      {top && (
        <text x={cx} y={cy + 24} textAnchor="middle" fill={mutedColor} fontSize={9}>
          {pct}% {top.category.split('-')[0]}
        </text>
      )}
    </g>
  )
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()
  const { formatCurrency, formatPercentage } = useFormatters()

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('charts.no_expenses')}</p>
      </div>
    )
  }

  const chartData = data.slice(0, 9).map((d) => ({
    ...d,
    name: d.category,
    value: d.total,
  }))

  const total = chartData.reduce((s, d) => s + d.value, 0)
  const top   = chartData[0] as CategoryTotal | undefined

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <defs>
            {chartData.map((_, i) => {
              const c = CHART_COLORS[i % CHART_COLORS.length]
              return (
                <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={c} stopOpacity={1} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.75} />
                </radialGradient>
              )
            })}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#pieGrad${index})`}
                stroke="transparent"
              />
            ))}
            <CenterLabel
              top={top}
              total={total}
              textColor={ct.tooltipText}
              mutedColor={ct.tooltipMuted}
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend rows */}
      <div className="space-y-2.5">
        {chartData.map((entry, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length]
          return (
            <div key={entry.category} className="flex items-center gap-2.5">
              <div
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }}
              />
              <span className="flex-1 truncate text-xs" style={{ color: ct.axisColor }}>
                {t(`categories.${entry.category}`)}
              </span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: ct.tooltipText }}>
                {formatCurrency(entry.value)}
              </span>
              <span
                className="w-10 text-right text-[10px] tabular-nums"
                style={{ color: ct.tooltipMuted }}
              >
                {formatPercentage(entry.percentage, 0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
