import { useIsDark } from './useTheme'

/**
 * Returns chart-specific color values that adapt to the current theme.
 * Recharts requires actual hex/rgb values — it cannot consume CSS variables.
 */
export function useChartTheme() {
  const isDark = useIsDark()

  return {
    axisColor: isDark ? '#9ca3af' : '#64748b',
    gridColor: isDark ? '#252535' : '#e2e8f0',
    tooltipBg: isDark ? '#1e1e2a' : '#ffffff',
    tooltipBorder: isDark ? '#252535' : '#e2e8f0',
    tooltipText: isDark ? '#f9fafb' : '#0f172a',
    tooltipMuted: isDark ? '#9ca3af' : '#64748b',
    cursorFill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  }
}
