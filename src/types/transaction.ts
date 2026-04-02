export type TransactionType = 'income' | 'expense'

export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other-income'
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'other-expense'

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface TransactionFilters {
  type?: TransactionType | 'all'
  category?: TransactionCategory | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
}

export interface CategoryTotal {
  category: TransactionCategory
  total: number
  percentage: number
  type: TransactionType
}

export const INCOME_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'salary', label: 'Salário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other-income', label: 'Outra receita' },
]

export const EXPENSE_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'housing', label: 'Moradia' },
  { value: 'health', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'shopping', label: 'Compras' },
  { value: 'utilities', label: 'Contas' },
  { value: 'other-expense', label: 'Outra despesa' },
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]
