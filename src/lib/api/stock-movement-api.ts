import * as store from "./mock-store"
import type { StockMovement, CreateStockMovementRequest } from "@/types/stock-movement"

type Actor = { userId: string; userName: string }
const defaultActor: Actor = { userId: "unknown", userName: "Sistema" }

export async function getStockMovements(productId: string): Promise<StockMovement[]> {
  return store.getStockMovements(productId)
}

export async function createStockMovement(
  productId: string,
  data: CreateStockMovementRequest,
  actor: Actor = defaultActor
): Promise<StockMovement> {
  return store.createStockMovement(productId, data, actor)
}
