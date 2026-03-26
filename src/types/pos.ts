import type { Product } from "./product"
import type { PaymentMethod } from "./sale"

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
  paymentMethod: PaymentMethod
}
