import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Transaction } from '@/types/transaction'
import { useFormatters } from '@/hooks/useFormatters'
import { useChartTheme } from '@/hooks/useChartTheme'
import { useTranslation } from '@/hooks/useTranslation'

interface DailyPoint {
  date: string
  label: string
  expense: number
  isPeak: boolean
}

function buildDailyData(
  transactions: Transaction[],
  formatDateShort: (d: string) => string
): DailyPoint[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'expense') {
      map.set(t.date, (map.get(t.date) ?? 0) + t.amount)
    }
  }
  if (!map.size) return []

  const sorted = Array.from(map.entries())
    .map(([date, expense]) => ({ date, expense }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const maxVal = Math.max(...sorted.map((d) => d.expense))

  return sorted.map((d) => ({
    ...d,
    label: formatDateShort(d.date),
    isPeak: d.expense === maxVal,
  }))
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: DailyPoint }>
  label?: string
}

function CustomTooltip({ active, payload }: TooltipProps) {
  const ct = useChartTheme()
  const { formatCurrency } = useFormatters()
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      className="rounded-xl border px-3 py-2.5 shadow-glass text-xs"
      style={{ background: ct.tooltipBg, borderColor: ct.tooltipBorder }}
    >
      <p className="mb-1" style={{ color: ct.tooltipMuted }}>
        {item.payload.label}
      </p>
      <p className="font-bold text-sm" style={{ color: '#ef4444' }}>
        {formatCurrency(item.value)}
      </p>
    </div>
  )
}

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: DailyPoint
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null
  if (payload.isPeak) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={10} fill="#ef4444" fillOpacity={0.2} />
      </g>
    )
  }
  return <circle cx={cx} cy={cy} r={3} fill="#6366f1" stroke="transparent" />
}

interface DailySpendingChartProps {
  transactions: Transaction[]
}

export function DailySpendingChart({ transactions }: DailySpendingChartProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()
  const { formatDateShort, formatCurrency } = useFormatters()

  const data = buildDailyData(transactions, formatDateShort)

  if (data.length < 2) {
    return (
      <div className="flex h-52 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('charts.no_data')}</p>
      </div>
    )
  }

  const peak = data.find((d) => d.isPeak)
  const avg = data.reduce((s, d) => s + d.expense, 0) / data.length

  return (
    <div className="space-y-3">
      {/* Peak callout */}
      {peak && (
        <div className="flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 px-3 py-2">
          <span className="text-xs text-muted-foreground">
            📈 Pico em <span className="font-medium text-foreground">{peak.label}</span>
          </span>
          <span className="text-xs font-bold text-danger">{formatCurrency(peak.expense)}</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} vertical={false} />

          <ReferenceLine
            y={avg}
            stroke={ct.gridColor}
            strokeDasharray="4 3"
            label={{
              value: 'Média',
              position: 'insideTopRight',
              fill: ct.tooltipMuted,
              fontSize: 9,
            }}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: ct.axisColor, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: ct.axisColor, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v: number) => {
              if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`
              return String(Math.round(v))
            }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: ct.gridColor, strokeWidth: 1 }} />

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
