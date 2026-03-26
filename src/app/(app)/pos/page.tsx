"use client"

import { useState } from "react"
import { LayoutGrid, CalendarDays } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { useCreateSale } from "@/hooks/use-sales"
import { useCart } from "@/contexts/cart-context"
import { useActiveEvent } from "@/hooks/use-events"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"
import { CartSheet } from "@/components/pos/cart-sheet"
import { CheckoutConfirmDialog } from "@/components/pos/checkout-confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { cn } from "@/lib/utils"
import type { CreateSaleRequest } from "@/types/sale"

const COL_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
type Cols = (typeof COL_OPTIONS)[number]

const colsClass: Record<Cols, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-4 lg:grid-cols-6",
  7: "grid-cols-4 lg:grid-cols-7",
  8: "grid-cols-4 lg:grid-cols-8",
  9: "grid-cols-4 lg:grid-cols-9",
  10: "grid-cols-4 lg:grid-cols-10",
}

export default function PosPage() {
  const { data: products, isLoading, error, refetch } = useProducts()
  const createSale = useCreateSale()
  const { items, total, paymentMethod, addItem, clearCart } = useCart()
  const { data: activeEvent } = useActiveEvent()
  const [cols, setCols] = useState<Cols>(3)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogPhase, setDialogPhase] = useState<"confirm" | "success">("confirm")

  function handleCheckout() {
    if (items.length === 0) return
    setDialogPhase("confirm")
    setDialogOpen(true)
  }

  function handleConfirm() {
    const request: CreateSaleRequest = {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod,
    }

    createSale.mutate(request, {
      onSuccess: () => {
        setDialogPhase("success")
      },
    })
  }

  function handleDialogClose(open: boolean) {
    if (!open && dialogPhase === "success") {
      clearCart()
    }
    setDialogOpen(open)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Toolbar row */}
      <div className="flex items-center gap-3 flex-wrap">
      {/* Grid size control */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        <LayoutGrid className="h-4 w-4 text-muted-foreground mx-1" />
        {COL_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setCols(n)}
            className={cn(
              "min-w-[28px] rounded px-2 py-1 text-xs font-medium transition-colors",
              n > 4 && "hidden lg:block",
              cols === n
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`${n} columnas`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Active event indicator */}
      {activeEvent && (
        <div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">{activeEvent.name}</span>
        </div>
      )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* Product grid */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid products={products ?? []} onAddItem={addItem} cols={cols} />
        </div>

        {/* Cart — desktop: side panel */}
        <div className="hidden md:flex w-60 lg:w-80 flex-col shrink-0">
          <CartPanel onCheckout={handleCheckout} isPending={createSale.isPending} />
        </div>

        {/* Cart — mobile: bottom sheet */}
        <div className="md:hidden">
          <CartSheet onCheckout={handleCheckout} isPending={createSale.isPending} />
        </div>
      </div>

      <CheckoutConfirmDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        phase={dialogPhase}
        items={items}
        total={total}
        paymentMethod={paymentMethod}
        onConfirm={handleConfirm}
        isPending={createSale.isPending}
      />
    </div>
  )
}
