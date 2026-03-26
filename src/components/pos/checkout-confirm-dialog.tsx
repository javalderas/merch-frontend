"use client"

import { CheckCircle2, Banknote, CreditCard, Smartphone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import type { CartItem } from "@/types/pos"
import type { PaymentMethod } from "@/types/sale"

const paymentLabels: Record<PaymentMethod, { label: string; icon: React.ReactNode }> = {
  CASH: { label: "Efectivo", icon: <Banknote className="size-4" /> },
  CARD: { label: "Tarjeta", icon: <CreditCard className="size-4" /> },
  BIZUM: { label: "Bizum", icon: <Smartphone className="size-4" /> },
}

type Phase = "confirm" | "success"

interface CheckoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phase: Phase
  items: CartItem[]
  total: number | string
  paymentMethod: PaymentMethod
  onConfirm: () => void
  isPending: boolean
}

export function CheckoutConfirmDialog({
  open,
  onOpenChange,
  phase,
  items,
  total,
  paymentMethod,
  onConfirm,
  isPending,
}: CheckoutConfirmDialogProps) {
  const pm = paymentLabels[paymentMethod]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm gap-0 p-0 overflow-hidden border-border/60 shadow-2xl"
        overlayClassName="bg-black/75 backdrop-blur-md"
      >
        {phase === "confirm" ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Confirmar cobro
              </DialogTitle>
            </DialogHeader>

            {/* Item list */}
            <ul className="divide-y divide-border/30 max-h-56 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex items-center justify-between px-6 py-3 gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.product.salePrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{formatCurrency(item.subtotal)}</p>
                </li>
              ))}
            </ul>

            {/* Total + payment method */}
            <div className="px-6 py-5 bg-muted/20 border-t border-border/40 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Método de pago</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {pm.icon}
                  {pm.label}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total a cobrar</span>
                <span className="text-4xl font-bold tracking-tight text-primary leading-none">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 px-6 py-4 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="font-medium"
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isPending}
                className="font-bold"
              >
                {isPending ? "Procesando..." : "Cobrar"}
              </Button>
            </div>
          </>
        ) : (
          /* Success phase */
          <div className="flex flex-col items-center gap-5 px-8 py-12 text-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="size-14 text-green-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold">¡Cobro completado!</p>
              <p className="text-5xl font-bold tracking-tight text-primary leading-none">
                {formatCurrency(total)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
              {pm.icon}
              <span>Pago con {pm.label}</span>
            </div>
            <Button
              size="lg"
              className="w-full mt-2 min-h-[52px] text-base font-bold"
              onClick={() => onOpenChange(false)}
            >
              Nueva venta
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
