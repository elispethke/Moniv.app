import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useFormatters } from '@/hooks/useFormatters'
import { useChartTheme } from '@/hooks/useChartTheme'
import { useTranslation } from '@/hooks/useTranslation'

interface MonthlyPoint {
  month: string
  income: number
  expense: number
  balance: number
}

interface TrendLineChartProps {
  data: MonthlyPoint[]
}

const ENG_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMonth(month: string, t: (k: string) => string): string {
  const m = parseInt(month.split('-')[1]) - 1
  return t(`charts.months.${ENG_MONTHS[m]}`)
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl border px-3.5 py-3 shadow-glass text-xs min-w-[140px]"
      style={{ background: ct.tooltipBg, borderColor: ct.tooltipBorder }}
    >
      <p className="mb-2 font-semibold text-[11px] uppercase tracking-wider" style={{ color: ct.tooltipMuted }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span style={{ color: ct.tooltipMuted }}>
              {entry.name === 'income' ? t('dashboard.income') : t('dashboard.expenses')}
            </span>
          </div>
          <span className="font-bold tabular-nums" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()

  if (data.length < 2) {
    return (
      <div className="flex h-52 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('charts.no_data')}</p>
      </div>
    )
  }

  const formatted = data.map((d) => ({ ...d, label: fmtMonth(d.month, t) }))
  const maxIncome  = Math.max(...data.map((d) => d.income))
  const maxExpense = Math.max(...data.map((d) => d.expense))

  const tickFmt = (v: number) =>
    Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v))

  // Compute total income vs expense for summary chips
  const totIncome  = data.reduce((s, d) => s + d.income, 0)
  const totExpense = data.reduce((s, d) => s + d.expense, 0)

  return (
    <div className="space-y-3">
      {/* Legend + summary chips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">{t('dashboard.income')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded-full bg-danger" />
            <span className="text-xs text-muted-foreground">{t('dashboard.expenses')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold tabular-nums">
          <span className="text-accent">{formatCurrency(totIncome)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-danger">{formatCurrency(totExpense)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={formatted} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <defs>
            {/* Income gradient fill */}
            <linearGradient id="trendIncomeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            {/* Expense gradient fill */}
            <linearGradient id="trendExpenseArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridColor} vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fill: ct.axisColor, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: ct.axisColor, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={tickFmt}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: ct.gridColor, strokeWidth: 1 }}
          />

          {/* Area fills */}
          <Area
            type="monotone"
            dataKey="income"
            fill="url(#trendIncomeArea)"
            stroke="none"
            activeDot={false}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="expense"
            fill="url(#trendExpenseArea)"
            stroke="none"
            activeDot={false}
            legendType="none"
          />

          {/* Glow layers (wide low-opacity lines behind sharp lines) */}
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={7}
            strokeOpacity={0.18}
            dot={false}
            activeDot={false}
            legendType="none"
            tooltipType="none"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={7}
            strokeOpacity={0.15}
            dot={false}
            activeDot={false}
            legendType="none"
            tooltipType="none"
          />

          {/* Sharp lines on top */}
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={(props: { cx?: number; cy?: number; payload?: MonthlyPoint }) => {
              if (!props.cx || !props.cy || !props.payload) return <g key="empty" />
              const isPeak = props.payload.income === maxIncome
              if (isPeak) {
                return (
                  <g key={`peak-inc-${props.cx}`}>
                    <circle cx={props.cx} cy={props.cy} r={5} fill="#10b981" stroke="#fff" strokeWidth={2} />
                    <circle cx={props.cx} cy={props.cy} r={9} fill="#10b981" fillOpacity={0.2} />
                  </g>
                )
              }
              return <circle key={`dot-inc-${props.cx}`} cx={props.cx} cy={props.cy} r={3} fill="#10b981" stroke="transparent" />
            }}
            activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
            name="income"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={(props: { cx?: number; cy?: number; payload?: MonthlyPoint }) => {
              if (!props.cx || !props.cy || !props.payload) return <g key="empty-e" />
              const isPeak = props.payload.expense === maxExpense
              if (isPeak) {
                return (
                  <g key={`peak-exp-${props.cx}`}>
                    <circle cx={props.cx} cy={props.cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    <circle cx={props.cx} cy={props.cy} r={9} fill="#ef4444" fillOpacity={0.2} />
                  </g>
                )
              }
              return <circle key={`dot-exp-${props.cx}`} cx={props.cx} cy={props.cy} r={3} fill="#ef4444" stroke="transparent" />
            }}
            activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
            name="expense"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
