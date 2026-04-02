export interface Goal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string  // YYYY-MM-DD
}

export type CreateGoalPayload = Omit<Goal, 'id'>
export type UpdateGoalPayload = Partial<Omit<Goal, 'id' | 'userId'>>
