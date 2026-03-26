"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { Product } from "@/types/product"
import type { PaymentMethod } from "@/types/sale"
import type { CartItem } from "@/types/pos"

interface CartContextType {
  items: CartItem[]
  paymentMethod: PaymentMethod
  total: number
  itemCount: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setPaymentMethod: (method: PaymentMethod) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * Number(product.salePrice),
              }
            : item
        )
      }
      return [...prev, { product, quantity: 1, subtotal: Number(product.salePrice) }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity, subtotal: quantity * Number(item.product.salePrice) }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setPaymentMethod("CASH")
  }, [])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        paymentMethod,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        setPaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
