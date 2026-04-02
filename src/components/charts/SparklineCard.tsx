import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { cn } from '@/utils/cn'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Variant = 'income' | 'expense' | 'savings'

interface SparklineCardProps {
  label: string
  value: string
  icon: React.ReactNode
  valueColor: string
  trend: number | null
  trendInverse?: boolean
  sparkData: number[]
  sparkColor: string
  variant: Variant
}

const VARIANT_STYLES: Record<Variant, {
  card: string
  iconRing: string
  iconBg: string
  iconColor: string
  glow: string
}> = {
  income: {
    card:     'border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent',
    iconRing: 'ring-1 ring-accent/30',
    iconBg:   'bg-accent/20',
    iconColor:'text-accent',
    glow:     '0 0 24px 0 rgba(16,185,129,0.18)',
  },
  expense: {
    card:     'border-danger/20 bg-gradient-to-br from-danger/10 via-danger/5 to-transparent',
    iconRing: 'ring-1 ring-danger/30',
    iconBg:   'bg-danger/20',
    iconColor:'text-danger',
    glow:     '0 0 24px 0 rgba(239,68,68,0.18)',
  },
  savings: {
    card:     'border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
    iconRing: 'ring-1 ring-primary/30',
    iconBg:   'bg-primary/20',
    iconColor:'text-primary',
    glow:     '0 0 24px 0 rgba(99,102,241,0.18)',
  },
}

function TrendBadge({ trend, inverse }: { trend: number | null; inverse?: boolean }) {
  if (trend === null) return null
  const positive = trend > 0
  const good = inverse ? !positive : positive
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0',
        good ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'
      )}
    >
      {trend === 0
        ? <Minus className="h-2.5 w-2.5" />
        : positive
          ? <TrendingUp className="h-2.5 w-2.5" />
          : <TrendingDown className="h-2.5 w-2.5" />}
      {Math.abs(trend).toFixed(0)}%
    </div>
  )
}

export function SparklineCard({
  label,
  value,
  icon,
  valueColor,
  trend,
  trendInverse,
  sparkData,
  sparkColor,
  variant,
}: SparklineCardProps) {
  const s = VARIANT_STYLES[variant]
  const chartData = sparkData.map((v) => ({ v }))
  const hasSpark  = sparkData.length >= 2

  return (
    <div
      className={cn('flex-1 rounded-2xl border overflow-hidden', s.card)}
      style={{ boxShadow: s.glow }}
    >
      <div className="p-3 pb-2">
        {/* Icon + trend row */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-xl flex-shrink-0',
            s.iconBg, s.iconRing
          )}>
            <div className={cn('h-3.5 w-3.5', s.iconColor)}>{icon}</div>
          </div>
          <TrendBadge trend={trend} inverse={trendInverse} />
        </div>

        {/* Label + Value */}
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className={cn('text-sm font-extrabold tabular-nums leading-none', valueColor)}>
          {value}
        </p>
      </div>

      {/* Sparkline */}
      {hasSpark && (
        <div className="h-9 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sk-${variant}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={1.5}
                fill={`url(#sk-${variant})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
