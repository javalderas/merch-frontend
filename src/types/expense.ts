export type ExpenseCategory = "PRODUCTION" | "TRANSPORT" | "VENUE" | "MARKETING" | "OTHER"

export interface Expense {
  id: string
  description: string
  amount: string
  category: ExpenseCategory
  date: string
  createdAt: string
}

export interface CreateExpenseRequest {
  description: string
  amount: string
  category: ExpenseCategory
  date: string
}

export interface UpdateExpenseRequest {
  description?: string
  amount?: string
  category?: ExpenseCategory
  date?: string
}
