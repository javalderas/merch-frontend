"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { CartPanel } from "@/components/pos/cart-panel"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

interface CartSheetProps {
  onCheckout: () => void
  isPending?: boolean
}

export function CartSheet({ onCheckout, isPending }: CartSheetProps) {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()

  function handleCheckout() {
    onCheckout()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-20 right-4 z-40 min-h-[56px] min-w-[56px] rounded-full shadow-lg md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir carrito"
      >
        <ShoppingCart className="size-6" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
          >
            {itemCount}
          </Badge>
        )}
      </Button>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle>Carrito</SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? "No hay productos en el carrito"
              : `${itemCount} ${itemCount === 1 ? "producto" : "productos"} en el carrito`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <CartPanel onCheckout={handleCheckout} isPending={isPending} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
