import type { Transaction, CategoryTotal } from '@/types/transaction'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PdfExportOptions {
  userName: string
  periodLabel: string
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
  transactions: Transaction[]
  categoryTotals: CategoryTotal[]
  language?: 'pt' | 'en' | 'de'
  currency?: string
}

// ── Category label map ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  pt: {
    salary: 'Salário', freelance: 'Freelance', investment: 'Investimento',
    'other-income': 'Outra receita', food: 'Alimentação', transport: 'Transporte',
    housing: 'Moradia', health: 'Saúde', education: 'Educação',
    entertainment: 'Entretenimento', shopping: 'Compras',
    utilities: 'Contas', 'other-expense': 'Outra despesa',
  },
  en: {
    salary: 'Salary', freelance: 'Freelance', investment: 'Investment',
    'other-income': 'Other income', food: 'Food', transport: 'Transport',
    housing: 'Housing', health: 'Health', education: 'Education',
    entertainment: 'Entertainment', shopping: 'Shopping',
    utilities: 'Utilities', 'other-expense': 'Other expense',
  },
  de: {
    salary: 'Gehalt', freelance: 'Freelance', investment: 'Investition',
    'other-income': 'Sonstiges Einkommen', food: 'Essen', transport: 'Transport',
    housing: 'Wohnen', health: 'Gesundheit', education: 'Bildung',
    entertainment: 'Unterhaltung', shopping: 'Einkaufen',
    utilities: 'Nebenkosten', 'other-expense': 'Sonstige Ausgaben',
  },
}

// ── Colors ─────────────────────────────────────────────────────────────────────

const C = {
  indigo:       [99, 102, 241] as [number, number, number],
  indigoLight:  [129, 131, 251] as [number, number, number],
  indigoFaint:  [238, 238, 254] as [number, number, number],
  green:        [16, 185, 129] as [number, number, number],
  greenFaint:   [209, 250, 229] as [number, number, number],
  red:          [239, 68, 68]  as [number, number, number],
  redFaint:     [254, 226, 226] as [number, number, number],
  dark:         [15, 15, 25]   as [number, number, number],
  gray900:      [17, 24, 39]   as [number, number, number],
  gray700:      [55, 65, 81]   as [number, number, number],
  gray500:      [107, 114, 128] as [number, number, number],
  gray200:      [229, 231, 235] as [number, number, number],
  gray100:      [243, 244, 246] as [number, number, number],
  white:        [255, 255, 255] as [number, number, number],
  pageBg:       [248, 248, 252] as [number, number, number],
}

const CHART_COLORS: [number, number, number][] = [
  [99, 102, 241], [139, 92, 246], [236, 72, 153], [16, 185, 129],
  [245, 158, 11], [59, 130, 246], [239, 68, 68],  [6, 182, 212],
]

// ── Formatter ─────────────────────────────────────────────────────────────────

function fmt(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(amount)
}

function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function groupByDate(txs: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date))
  for (const t of sorted) {
    if (!map.has(t.date)) map.set(t.date, [])
    map.get(t.date)!.push(t)
  }
  return map
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function exportStatementPdf(opts: PdfExportOptions): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const lang = opts.language ?? 'pt'
  const catLabels = CATEGORY_LABELS[lang]
  const currency  = opts.currency ?? 'EUR'

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const margin = 16
  const inner  = W - margin * 2

  // ── Page background ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.pageBg)
  doc.rect(0, 0, W, 297, 'F')

  let y = 0

  // ── HEADER BAND ─────────────────────────────────────────────────────────────
  // Gradient-simulated header (two overlapping rects)
  doc.setFillColor(...C.indigo)
  doc.rect(0, 0, W, 44, 'F')
  doc.setFillColor(...C.indigoLight)
  doc.rect(W - 80, 0, 80, 44, 'F')
  // Subtle diagonal accent
  doc.setFillColor(129, 131, 251)
  doc.setGState(doc.GState({ opacity: 0.25 }))
  doc.triangle(W, 0, W, 44, W - 60, 0, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  // Logo circle
  doc.setFillColor(255, 255, 255, 0.15)
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.12 }))
  doc.circle(margin + 6, 22, 8, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  // "M" wordmark in circle
  doc.setTextColor(...C.white)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('M', margin + 6, 25, { align: 'center' })

  // App name
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Moniv', margin + 17, 20)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 255)
  doc.text('Extrato Financeiro', margin + 17, 26)

  // Period + user (right aligned)
  doc.setTextColor(...C.white)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(opts.periodLabel, W - margin, 18, { align: 'right' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 255)
  doc.text(opts.userName, W - margin, 25, { align: 'right' })

  // Generated date
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 230)
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-PT')}`,
    W - margin, 31, { align: 'right' }
  )

  y = 54

  // ── SUMMARY CARDS ────────────────────────────────────────────────────────────
  const cardW = (inner - 6) / 3
  const cards = [
    { label: 'Receitas',  value: fmt(opts.totalIncome, currency),  bg: C.greenFaint, accent: C.green,  dot: C.green },
    { label: 'Despesas',  value: fmt(opts.totalExpense, currency),  bg: C.redFaint,   accent: C.red,    dot: C.red   },
    { label: 'Saldo',     value: fmt(opts.balance, currency),       bg: C.indigoFaint,accent: C.indigo, dot: C.indigo },
  ]

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 3)
    // Card background
    doc.setFillColor(...card.bg)
    doc.roundedRect(x, y, cardW, 22, 3, 3, 'F')
    // Left accent bar
    doc.setFillColor(...card.accent)
    doc.roundedRect(x, y, 2.5, 22, 1, 1, 'F')
    // Label
    doc.setTextColor(...card.dot)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(card.label.toUpperCase(), x + 6, y + 8)
    // Value
    doc.setTextColor(...C.gray900)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, x + 6, y + 17)
  })

  // Savings rate chip
  if (opts.savingsRate > 0) {
    const chipX = margin
    const chipY = y + 26
    doc.setFillColor(...C.indigoFaint)
    doc.roundedRect(chipX, chipY, 60, 7, 2, 2, 'F')
    doc.setTextColor(...C.indigo)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(`Taxa de Poupança: ${opts.savingsRate.toFixed(1)}%`, chipX + 4, chipY + 4.8)
  }

  y += 38

  // ── DIVIDER ──────────────────────────────────────────────────────────────────
  doc.setDrawColor(...C.gray200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 6

  // ── CATEGORY DISTRIBUTION ────────────────────────────────────────────────────
  if (opts.categoryTotals.length > 0) {
    // Section heading
    doc.setFillColor(...C.indigo)
    doc.roundedRect(margin, y, 3, 7, 1, 1, 'F')
    doc.setTextColor(...C.gray900)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Despesas por Categoria', margin + 6, y + 5.5)
    y += 12

    const maxCats = Math.min(opts.categoryTotals.length, 8)
    const total   = opts.categoryTotals.reduce((s, c) => s + c.total, 0)

    // Draw simple horizontal bar chart
    const barAreaW = inner
    const rowH = 9
    for (let i = 0; i < maxCats; i++) {
      const cat   = opts.categoryTotals[i]
      const color = CHART_COLORS[i % CHART_COLORS.length]
      const pct   = total > 0 ? cat.total / total : 0
      const label = catLabels[cat.category] ?? cat.category
      const barW  = barAreaW * 0.45 * pct

      const rowY = y + i * rowH

      // Dot
      doc.setFillColor(...color)
      doc.circle(margin + 1.5, rowY + 3, 1.5, 'F')

      // Category name
      doc.setTextColor(...C.gray700)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(label, margin + 5, rowY + 4.5)

      // Bar background
      const barX = margin + 60
      doc.setFillColor(...C.gray200)
      doc.roundedRect(barX, rowY + 1, barAreaW * 0.45, 4, 1, 1, 'F')

      // Bar fill
      if (barW > 0) {
        doc.setFillColor(...color)
        doc.roundedRect(barX, rowY + 1, barW, 4, 1, 1, 'F')
      }

      // Percentage + amount
      doc.setTextColor(...C.gray700)
      doc.setFontSize(7.5)
      doc.text(`${cat.percentage.toFixed(1)}%`, barX + barAreaW * 0.45 + 3, rowY + 4.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.gray900)
      doc.text(fmt(cat.total, currency), W - margin, rowY + 4.5, { align: 'right' })
      doc.setFont('helvetica', 'normal')
    }

    y += maxCats * rowH + 6

    // Divider
    doc.setDrawColor(...C.gray200)
    doc.setLineWidth(0.3)
    doc.line(margin, y, W - margin, y)
    y += 6
  }

  // ── TRANSACTIONS TABLE ───────────────────────────────────────────────────────
  // Section heading
  doc.setFillColor(...C.indigo)
  doc.roundedRect(margin, y, 3, 7, 1, 1, 'F')
  doc.setTextColor(...C.gray900)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Movimentos', margin + 6, y + 5.5)
  y += 10

  const grouped = groupByDate(opts.transactions)
  const tableBody: (string | { content: string; styles: object })[][] = []

  for (const [date, txs] of grouped) {
    // Date header row
    tableBody.push([
      {
        content: fmtDate(date),
        colSpan: 4,
        styles: {
          fillColor: C.indigoFaint,
          textColor: C.indigo,
          fontStyle: 'bold',
          fontSize: 8,
        },
      } as any,
      '', '', '',
    ])

    for (const tx of txs) {
      const isIncome = tx.type === 'income'
      const amtStr   = (isIncome ? '+' : '-') + fmt(tx.amount, currency)
      tableBody.push([
        catLabels[tx.category] ?? tx.category,
        tx.description || '-',
        { content: amtStr, styles: { textColor: isIncome ? C.green : C.red, fontStyle: 'bold' } } as any,
        tx.type === 'income' ? 'Receita' : 'Despesa',
      ])
    }
  }

  autoTable(doc, {
    startY: y,
    head: [['Categoria', 'Descrição', 'Valor', 'Tipo']],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: C.gray200,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C.indigo,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: C.gray100,
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 36, halign: 'right' },
      3: { cellWidth: 22, halign: 'center' },
    },
    didParseCell: (data) => {
      // Skip colSpan separator cells
      const raw = data.row.raw
      if (data.column.index > 0 && Array.isArray(raw) && raw[0] && (raw[0] as Record<string, unknown>).colSpan) {
        data.cell.text = []
      }
    },
  })

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    const pageH = 297

    doc.setFillColor(...C.indigo)
    doc.rect(0, pageH - 10, W, 10, 'F')

    doc.setTextColor(...C.white)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Moniv — Extrato gerado automaticamente. Não constitui documento fiscal.', margin, pageH - 4)
    doc.text(`Pág. ${p}/${pageCount}`, W - margin, pageH - 4, { align: 'right' })
  }

  // ── Download ─────────────────────────────────────────────────────────────────
  const safeLabel = opts.periodLabel.replace(/\s+/g, '-').toLowerCase()
  doc.save(`moniv-extrato-${safeLabel}.pdf`)
}
