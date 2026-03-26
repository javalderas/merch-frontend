import * as store from "./mock-store"
import type { Sale, CreateSaleRequest } from "@/types/sale"

type Actor = { userId: string; userName: string }
const defaultActor: Actor = { userId: "unknown", userName: "Sistema" }

export async function getSales(dateFrom?: string, dateTo?: string): Promise<Sale[]> {
  return store.getSales(dateFrom, dateTo)
}

export async function getSale(id: string): Promise<Sale> {
  return store.getSale(id)
}

export async function createSale(data: CreateSaleRequest, actor: Actor = defaultActor): Promise<Sale> {
  return store.createSale(data, actor)
}
