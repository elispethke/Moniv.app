export interface Installment {
  id: string
  userId: string
  totalAmount: number
  totalInstallments: number
  description: string
  startDate: string  // YYYY-MM-DD
}

export type CreateInstallmentPayload = Omit<Installment, 'id'>
