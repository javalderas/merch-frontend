"use client"

import { Minus, Plus, Trash2, ShoppingBasket, Banknote, CreditCard, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { useCart } from "@/contexts/cart-context"
import type { PaymentMethod } from "@/types/sale"

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH", label: "Efectivo", icon: <Banknote className="size-4" /> },
  { value: "CARD", label: "Tarjeta", icon: <CreditCard className="size-4" /> },
  { value: "BIZUM", label: "Bizum", icon: <Smartphone className="size-4" /> },
]

interface CartPanelProps {
  onCheckout: () => void
  isPending?: boolean
}

export function CartPanel({ onCheckout, isPending }: CartPanelProps) {
  const {
    items,
    total,
    paymentMethod,
    updateQuantity,
    removeItem,
    setPaymentMethod,
  } = useCart()

  const isEmpty = items.length === 0

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-primary/10 px-4 py-3">
        <ShoppingBasket className="size-5 text-primary" />
        <span className="font-semibold text-sm text-primary">
          {isEmpty ? "Carrito vacío" : `${items.length} ${items.length === 1 ? "producto" : "productos"}`}
        </span>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
            <ShoppingBasket className="size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Toca un producto para añadirlo</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {items.map((item, i) => (
              <li
                key={item.product.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2",
                  i % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-primary font-semibold">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      item.quantity === 1
                        ? removeItem(item.product.id)
                        : updateQuantity(item.product.id, item.quantity - 1)
                    }
                    aria-label="Reducir cantidad"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="size-3.5" />
                    ) : (
                      <Minus className="size-3.5" />
                    )}
                  </Button>
                  <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 bg-muted/20 p-4 grid gap-3">
        {/* Total */}
        <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
          <span className="text-sm font-semibold text-primary">Total</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>

        {/* Payment method */}
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => (
            <Button
              key={method.value}
              variant={paymentMethod === method.value ? "default" : "outline"}
              className={cn(
                "min-h-[44px] flex-col gap-1 h-auto py-2 text-xs",
                paymentMethod === method.value && "border-primary"
              )}
              onClick={() => setPaymentMethod(method.value)}
              type="button"
            >
              {method.icon}
              {method.label}
            </Button>
          ))}
        </div>

        {/* Checkout */}
        <Button
          size="lg"
          className="min-h-[56px] text-lg font-bold"
          disabled={isEmpty || isPending}
          onClick={onCheckout}
        >
          {isPending ? "Procesando..." : `Cobrar ${isEmpty ? "" : formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  )
}
