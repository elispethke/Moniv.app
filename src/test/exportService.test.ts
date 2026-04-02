import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportService } from '@/services/exportService'
import type { Transaction } from '@/types/transaction'

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 1500,
    description: 'Monthly salary',
    category: 'salary',
    date: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    type: 'expense',
    amount: 49.99,
    description: 'Supermarket, weekly',   // has comma — should be quoted
    category: 'food',
    date: '2024-01-05',
    createdAt: '2024-01-05T00:00:00Z',
  },
]

describe('exportService.downloadTransactionsCsv', () => {
  let clickMock: ReturnType<typeof vi.fn>
  let anchorElement: HTMLAnchorElement
  let capturedBlob: Blob | null

  beforeEach(() => {
    capturedBlob = null
    clickMock = vi.fn()
    anchorElement = { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement

    // Capture the real Blob passed to createObjectURL without replacing the Blob constructor
    vi.spyOn(URL, 'createObjectURL').mockImplementation((obj: Blob | MediaSource) => {
      capturedBlob = obj as Blob
      return 'blob:mock-url'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(anchorElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers a browser download', () => {
    exportService.downloadTransactionsCsv(sampleTransactions)
    expect(clickMock).toHaveBeenCalledOnce()
  })

  it('sets the correct default filename', () => {
    exportService.downloadTransactionsCsv(sampleTransactions)
    expect(anchorElement.download).toBe('moniv-transactions.csv')
  })

  it('sets a custom filename when provided', () => {
    exportService.downloadTransactionsCsv(sampleTransactions, 'my-export.csv')
    expect(anchorElement.download).toBe('my-export.csv')
  })

  it('revokes the object URL after download', () => {
    exportService.downloadTransactionsCsv(sampleTransactions)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('includes correct CSV headers and row count', async () => {
    exportService.downloadTransactionsCsv(sampleTransactions)
    const text = await capturedBlob!.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('Date,Type,Description,Category,Amount')
    expect(lines).toHaveLength(sampleTransactions.length + 1)
  })

  it('formats amounts with 2 decimal places', async () => {
    exportService.downloadTransactionsCsv(sampleTransactions)
    const text = await capturedBlob!.text()
    expect(text).toContain('1500.00')
    expect(text).toContain('49.99')
  })

  it('wraps values containing commas in double quotes', async () => {
    exportService.downloadTransactionsCsv(sampleTransactions)
    const text = await capturedBlob!.text()
    expect(text).toContain('"Supermarket, weekly"')
  })

  it('handles an empty transactions array', async () => {
    exportService.downloadTransactionsCsv([])
    expect(clickMock).toHaveBeenCalledOnce()
    const text = await capturedBlob!.text()
    expect(text.trim()).toBe('Date,Type,Description,Category,Amount')
  })
})
