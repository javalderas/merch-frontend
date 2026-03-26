export type PaymentMethod = "CASH" | "CARD" | "BIZUM"

export interface SaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: string
  subtotal: string
}

export interface Sale {
  id: string
  items: SaleItem[]
  total: string
  paymentMethod: PaymentMethod
  notes: string | null
  createdAt: string
  sellerName?: string
  eventId?: string
  eventName?: string
}

export interface CreateSaleItemRequest {
  productId: string
  quantity: number
}

export interface CreateSaleRequest {
  items: CreateSaleItemRequest[]
  paymentMethod: PaymentMethod
  notes?: string
}
