import * as store from "./mock-store"
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from "@/types/expense"

type Actor = { userId: string; userName: string }
const defaultActor: Actor = { userId: "unknown", userName: "Sistema" }

export async function getExpenses(dateFrom?: string, dateTo?: string, category?: string): Promise<Expense[]> {
  return store.getExpenses(dateFrom, dateTo, category)
}

export async function createExpense(data: CreateExpenseRequest, actor: Actor = defaultActor): Promise<Expense> {
  return store.createExpense(data, actor)
}

export async function updateExpense(id: string, data: UpdateExpenseRequest, actor: Actor = defaultActor): Promise<Expense> {
  return store.updateExpense(id, data, actor)
}

export async function deleteExpense(id: string, actor: Actor = defaultActor): Promise<void> {
  return store.deleteExpense(id, actor)
}
