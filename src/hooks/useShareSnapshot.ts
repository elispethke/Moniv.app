import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useFormatters } from '@/hooks/useFormatters'
import { usePeriodStore } from '@/store/usePeriodStore'
import { filterByPeriod } from '@/utils/calculations'

/** Draws a rounded rectangle path (safe cross-browser). */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/** Generates a 1080×1080 financial snapshot PNG and returns it as Blob. */
async function buildSnapshotBlob(
  formatCurrency: (n: number) => string,
  totalIncome: number,
  totalExpense: number,
  balance: number,
  savingsRate: number,
): Promise<Blob | null> {
  const W = 1080
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // ── Background ────────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0a0a0f')
  bgGrad.addColorStop(1, '#0f0f1a')
  roundRect(ctx, 0, 0, W, H, 0)
  ctx.fillStyle = bgGrad
  ctx.fill()

  // Primary glow (top-left)
  const glow1 = ctx.createRadialGradient(180, 200, 0, 180, 200, 420)
  glow1.addColorStop(0, 'rgba(99,102,241,0.28)')
  glow1.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, W, H)

  // Accent glow (bottom-right)
  const glow2 = ctx.createRadialGradient(900, 880, 0, 900, 880, 300)
  glow2.addColorStop(0, 'rgba(16,185,129,0.18)')
  glow2.addColorStop(1, 'rgba(16,185,129,0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  // ── Header: Moniv brand ───────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.font = 'bold 52px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('Moniv', W / 2, 118)

  ctx.font = '28px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText('Financial Summary', W / 2, 172)

  // Divider
  ctx.beginPath()
  ctx.moveTo(90, 210)
  ctx.lineTo(W - 90, 210)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // ── Balance ───────────────────────────────────────────────────────────────
  ctx.font = '30px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.textAlign = 'center'
  ctx.fillText('Total Balance', W / 2, 305)

  ctx.font = 'bold 88px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = balance >= 0 ? '#10b981' : '#ef4444'
  ctx.fillText(formatCurrency(balance), W / 2, 420)

  // ── Income / Expense cards ────────────────────────────────────────────────
  const cardY = 495
  const cardH = 176
  const cardW = 428
  const gap = 28
  const leftX = (W - cardW * 2 - gap) / 2
  const rightX = leftX + cardW + gap

  // Income card
  roundRect(ctx, leftX, cardY, cardW, cardH, 24)
  ctx.fillStyle = 'rgba(16,185,129,0.12)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(16,185,129,0.28)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.font = '26px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.textAlign = 'center'
  ctx.fillText('Income', leftX + cardW / 2, cardY + 58)
  ctx.font = 'bold 44px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = '#10b981'
  ctx.fillText(formatCurrency(totalIncome), leftX + cardW / 2, cardY + 122)

  // Expense card
  roundRect(ctx, rightX, cardY, cardW, cardH, 24)
  ctx.fillStyle = 'rgba(239,68,68,0.12)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(239,68,68,0.28)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.font = '26px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.textAlign = 'center'
  ctx.fillText('Expenses', rightX + cardW / 2, cardY + 58)
  ctx.font = 'bold 44px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = '#ef4444'
  ctx.fillText(formatCurrency(totalExpense), rightX + cardW / 2, cardY + 122)

  // ── Savings rate bar ──────────────────────────────────────────────────────
  const barY = 720
  const barW = W - 180
  const barH = 12
  const barX = 90
  const pct = Math.min(Math.max(savingsRate / 100, 0), 1)

  roundRect(ctx, barX, barY, barW, barH, 6)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fill()

  if (pct > 0) {
    roundRect(ctx, barX, barY, barW * pct, barH, 6)
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW * pct, 0)
    barGrad.addColorStop(0, '#6366f1')
    barGrad.addColorStop(1, '#10b981')
    ctx.fillStyle = barGrad
    ctx.fill()
  }

  ctx.font = '26px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.textAlign = 'center'
  ctx.fillText(`Savings rate: ${savingsRate.toFixed(1)}%`, W / 2, barY + 52)

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.beginPath()
  ctx.moveTo(90, 840)
  ctx.lineTo(W - 90, 840)
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.font = 'bold 26px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.textAlign = 'center'
  ctx.fillText('Made with Moniv', W / 2, 908)

  ctx.font = '22px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillText(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    W / 2,
    952,
  )

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useShareSnapshot() {
  const [isCapturing, setIsCapturing] = useState(false)
  const { transactions } = useTransactions()
  const { formatCurrency } = useFormatters()
  const { preset, customFrom, customTo } = usePeriodStore()

  const getSnapshotData = () => {
    const periodTx = filterByPeriod(transactions, preset, customFrom, customTo)
    const totalIncome = periodTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const totalExpense = periodTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const balance = totalIncome - totalExpense
    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    return { totalIncome, totalExpense, balance, savingsRate }
  }

  const downloadSnapshot = async () => {
    setIsCapturing(true)
    try {
      const { totalIncome, totalExpense, balance, savingsRate } = getSnapshotData()
      const blob = await buildSnapshotBlob(
        formatCurrency, totalIncome, totalExpense, balance, savingsRate,
      )
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'moniv-financial-snapshot.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[snapshot] download error:', err)
    } finally {
      setIsCapturing(false)
    }
  }

  const shareSnapshot = async () => {
    setIsCapturing(true)
    try {
      const { totalIncome, totalExpense, balance, savingsRate } = getSnapshotData()
      const blob = await buildSnapshotBlob(
        formatCurrency, totalIncome, totalExpense, balance, savingsRate,
      )
      if (!blob) return

      // Try Web Share API with file support
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'moniv-snapshot.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Moniv Financial Snapshot',
            text: 'Check out my financial summary! 📊',
          })
          return
        }
      }
      // Fallback: download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'moniv-snapshot.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[snapshot] share error:', err)
    } finally {
      setIsCapturing(false)
    }
  }

  return { isCapturing, downloadSnapshot, shareSnapshot }
}
