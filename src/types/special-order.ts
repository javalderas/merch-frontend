export type SpecialOrderStatus = "PENDING" | "RECEIVED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
export type DeliveryMethod = "PICKUP" | "SHIPPING"
export type SpecialOrderPaymentMethod = "CASH" | "CARD" | "BIZUM" | "COD"
export type PaymentStatus = "PAID" | "PENDING"

export interface SpecialOrderItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  unitPrice: string
  subtotal: string
}

export interface SpecialOrder {
  id: string
  customerName: string
  customerPhone?: string
  items: SpecialOrderItem[]
  total: string
  deliveryMethod: DeliveryMethod
  shippingAddress?: string
  shippingCost?: string
  paymentMethod: SpecialOrderPaymentMethod
  paymentStatus: PaymentStatus
  status: SpecialOrderStatus
  notes?: string
  createdAt: string
  updatedAt: string
  sellerName?: string
}

export interface CreateSpecialOrderRequest {
  customerName: string
  customerPhone?: string
  items: Array<{ productId?: string; productName: string; quantity: number; unitPrice: number }>
  deliveryMethod: DeliveryMethod
  shippingAddress?: string
  shippingCost?: number
  paymentMethod: SpecialOrderPaymentMethod
  notes?: string
}
