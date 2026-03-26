export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT"

export interface StockMovement {
  id: string
  productId: string
  type: StockMovementType
  quantity: number
  reason: string | null
  createdAt: string
}

export interface CreateStockMovementRequest {
  type: StockMovementType
  quantity: number
  reason?: string
}
