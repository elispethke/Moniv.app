export interface Budget {
  id: string
  userId: string
  category: string
  limit: number
  month: string  // YYYY-MM
}

export type CreateBudgetPayload = Omit<Budget, 'id'>
