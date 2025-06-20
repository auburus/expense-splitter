export interface User {
  id: number
  name: string
}

export interface Split {
  amount: number
  participant: User
}

export interface Expense {
  amount: number
  concept: string
  payee: User
  split: Split[]
}

export interface Debt {
  participant: User
  paid: number
  received: number
}

export interface Transfer {
  src: User
  dst: User
  amount: number
}
