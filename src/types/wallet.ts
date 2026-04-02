export interface Wallet {
  id: string
  userId: string
  name: string
  balance: number
}

export type CreateWalletPayload = Omit<Wallet, 'id'>
