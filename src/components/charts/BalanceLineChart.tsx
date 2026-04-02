import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useFormatters } from '@/hooks/useFormatters'
import { useChartTheme } from '@/hooks/useChartTheme'
import { useTranslation } from '@/hooks/useTranslation'

interface DataPoint {
  date: string
  balance: number
}

interface BalanceLineChartProps {
  data: DataPoint[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  const ct = useChartTheme()
  const { formatCurrency } = useFormatters()
  if (!active || !payload?.length) return null
  const value = payload[0].value
  const isPositive = value >= 0

  return (
    <div
      className="rounded-xl border px-3 py-2.5 shadow-glass text-xs"
      style={{
        background: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
      }}
    >
      <p style={{ color: ct.tooltipMuted }} className="mb-1">
        {label}
      </p>
      <p
        className="font-bold"
        style={{ color: isPositive ? '#10b981' : '#ef4444' }}
      >
        {formatCurrency(value)}
      </p>
    </div>
  )
}

function formatYAxis(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(Math.round(value))
}

export function BalanceLineChart({ data }: BalanceLineChartProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()
  const { formatDateShort } = useFormatters()

  if (data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('charts.no_data')}</p>
      </div>
    )
  }

  const lastBalance = data[data.length - 1].balance
  const isPositive = lastBalance >= 0
  const lineColor = isPositive ? '#10b981' : '#ef4444'
  const gradientId = 'balanceGradient'

  const formatted = data.map((d) => ({
    ...d,
    label: formatDateShort(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={lineColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke={ct.gridColor}
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{ fill: ct.axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tick={{ fill: ct.axisColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          width={42}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: ct.gridColor, strokeWidth: 1 }} />

        <ReferenceLine y={0} stroke={ct.gridColor} strokeDasharray="4 2" />

        <Area
          type="monotone"
          dataKey="balance"
          stroke={lineColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: lineColor, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
