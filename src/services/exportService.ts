import type { Transaction } from '@/types/transaction'

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converts transactions to a CSV string and triggers a browser download.
 * Pure frontend — no server required.
 */
export const exportService = {
  downloadTransactionsCsv(transactions: Transaction[], filename = 'moniv-transactions.csv'): void {
    const headers = ['Date', 'Type', 'Description', 'Category', 'Amount']
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      t.description,
      t.category,
      t.amount.toFixed(2),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  },
}
