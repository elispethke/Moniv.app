import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useFormatters } from '@/hooks/useFormatters'
import { useChartTheme } from '@/hooks/useChartTheme'
import { useTranslation } from '@/hooks/useTranslation'

interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
}

interface MonthlyBarChartProps {
  data: MonthlyData[]
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

const ENG_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMonth(month: string, t: (k: string) => string): string {
  const m = parseInt(month.split('-')[1]) - 1
  return t(`charts.months.${ENG_MONTHS[m]}`)
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const ct = useChartTheme()
  const { t } = useTranslation()

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('charts.no_data')}</p>
      </div>
    )
  }

  const formatted = data.map((d) => ({ ...d, label: fmtMonth(d.month, t) }))
  const maxIncome  = Math.max(...data.map((d) => d.income))
  const maxExpense = Math.max(...data.map((d) => d.expense))

  const tickFmt = (v: number) =>
    Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v))

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-4 rounded-full bg-accent" />
          <span className="text-xs text-muted-foreground">{t('dashboard.income')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-4 rounded-full bg-danger" />
          <span className="text-xs text-muted-foreground">{t('dashboard.expenses')}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} barCategoryGap="28%" barGap={3} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="barExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="barIncomePeakGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="barExpensePeakGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
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
            tickFormatter={tickFmt}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: ct.cursorFill, rx: 4 }} />

          <Bar dataKey="income" radius={[6, 6, 2, 2]} name="income" maxBarSize={32}>
            {formatted.map((entry, i) => (
              <Cell
                key={`inc-${i}`}
                fill={entry.income === maxIncome ? 'url(#barIncomePeakGrad)' : 'url(#barIncomeGrad)'}
              />
            ))}
          </Bar>
          <Bar dataKey="expense" radius={[6, 6, 2, 2]} name="expense" maxBarSize={32}>
            {formatted.map((entry, i) => (
              <Cell
                key={`exp-${i}`}
                fill={entry.expense === maxExpense ? 'url(#barExpensePeakGrad)' : 'url(#barExpenseGrad)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
