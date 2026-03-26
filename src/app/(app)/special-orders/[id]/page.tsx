"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { useSpecialOrder, useUpdateSpecialOrderStatus, useMarkSpecialOrderPaid } from "@/hooks/use-special-orders"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { SpecialOrderStatus, DeliveryMethod } from "@/types/special-order"

export default function SpecialOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { can } = useAuth()
  const { data: order, isLoading, error, refetch } = useSpecialOrder(id)
  const updateStatus = useUpdateSpecialOrderStatus()
  const markPaid = useMarkSpecialOrderPaid()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />
  if (!order) return null

  const nextStatus = getNextStatus(order.status, order.deliveryMethod)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 min-h-[44px] min-w-[44px]" asChild>
          <Link href="/special-orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex-1 truncate">{order.customerName}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Información del cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{order.customerName}</p>
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{order.customerPhone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DeliveryBadge method={order.deliveryMethod} />
          </div>
          {order.deliveryMethod === "SHIPPING" && order.shippingAddress && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{order.shippingAddress}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Creado el {formatDateTime(order.createdAt)}
          </p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 text-sm">
            {order.shippingCost && Number(order.shippingCost) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Gastos de envío</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Método</span>
            <span className="font-medium">{paymentMethodLabel(order.paymentMethod)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estado</span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
          {order.paymentStatus === "PENDING" && can("orders:manage") && (
            <Button
              className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
              onClick={() => markPaid.mutate(order.id)}
              disabled={markPaid.isPending}
            >
              {markPaid.isPending ? "Procesando..." : "Marcar como pagado"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status actions */}
      {nextStatus && order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full min-h-[44px]"
              onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus.status })}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Actualizando..." : nextStatus.label}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getNextStatus(
  status: SpecialOrderStatus,
  deliveryMethod: DeliveryMethod
): { status: SpecialOrderStatus; label: string } | null {
  if (status === "PENDING") return { status: "RECEIVED", label: "Marcar como recibido" }
  if (status === "RECEIVED") {
    if (deliveryMethod === "SHIPPING") return { status: "SHIPPED", label: "Preparar envío" }
    return { status: "DELIVERED", label: "Entregar" }
  }
  if (status === "SHIPPED") return { status: "DELIVERED", label: "Marcar como entregado" }
  return null
}

function paymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    BIZUM: "Bizum",
    COD: "Contrareembolso",
  }
  return labels[method] ?? method
}

function StatusBadge({ status }: { status: SpecialOrderStatus }) {
  const map: Record<SpecialOrderStatus, { label: string; className: string }> = {
    PENDING: { label: "Pendiente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    RECEIVED: { label: "Recibido", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    SHIPPED: { label: "Enviado", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    DELIVERED: { label: "Entregado", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    CANCELLED: { label: "Cancelado", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  }
  const { label, className } = map[status]
  return <Badge className={className}>{label}</Badge>
}

function DeliveryBadge({ method }: { method: "PICKUP" | "SHIPPING" }) {
  return method === "PICKUP" ? (
    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Recogida en mano</Badge>
  ) : (
    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Envío por paquetería</Badge>
  )
}

function PaymentStatusBadge({ status }: { status: "PAID" | "PENDING" }) {
  return status === "PAID" ? (
    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pagado</Badge>
  ) : (
    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendiente de pago</Badge>
  )
}
