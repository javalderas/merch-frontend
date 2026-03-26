"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, ClipboardList, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CreateSpecialOrderDialog } from "@/components/special-orders/create-special-order-dialog"
import { useSpecialOrders } from "@/hooks/use-special-orders"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { SpecialOrderStatus, DeliveryMethod, PaymentStatus } from "@/types/special-order"

type FilterTab = "all" | SpecialOrderStatus
type DeliveryFilter = "ALL" | DeliveryMethod
type PaymentFilter = "ALL" | PaymentStatus

const TABS: { label: string; value: FilterTab }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Enviados", value: "SHIPPED" },
  { label: "Entregados", value: "DELIVERED" },
]

const DELIVERY_PILLS: { label: string; value: DeliveryFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Recogida", value: "PICKUP" },
  { label: "Envío", value: "SHIPPING" },
]

const PAYMENT_STATUS_PILLS: { label: string; value: PaymentFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Pagado", value: "PAID" },
  { label: "Pendiente de pago", value: "PENDING" },
]

const pillBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap"
const pillActive = "bg-primary text-primary-foreground border-primary"
const pillInactive =
  "bg-muted/40 text-muted-foreground hover:text-foreground border-border"

export default function SpecialOrdersPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("ALL")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL")

  const { data: orders, isLoading } = useSpecialOrders(
    activeTab === "all" ? undefined : activeTab
  )

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (q && !order.customerName.toLowerCase().includes(q)) return false
      if (deliveryFilter !== "ALL" && order.deliveryMethod !== deliveryFilter) return false
      if (paymentFilter !== "ALL" && order.paymentStatus !== paymentFilter) return false
      return true
    })
  }, [orders, search, deliveryFilter, paymentFilter])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos especiales</h1>
        <Button
          className="min-h-[44px] gap-2 shrink-0"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo pedido
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Extra filters */}
      <div className="space-y-3">
        {/* Search by customer name */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 min-h-[44px]"
            placeholder="Buscar por nombre de cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Delivery + payment status pills */}
        <div className="flex flex-wrap items-center gap-2">
          {DELIVERY_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setDeliveryFilter(pill.value)}
              className={cn(pillBase, deliveryFilter === pill.value ? pillActive : pillInactive)}
            >
              {pill.label}
            </button>
          ))}

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          {PAYMENT_STATUS_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setPaymentFilter(pill.value)}
              className={cn(pillBase, paymentFilter === pill.value ? pillActive : pillInactive)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/special-orders/${order.id}`}
              className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {order.items[0].productName}
                    {order.items.length > 1 && (
                      <span className="ml-1">y {order.items.length - 1} más</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <DeliveryBadge method={order.deliveryMethod} />
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(order.total)}</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">No hay pedidos especiales</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Crea un nuevo pedido para comenzar
          </p>
        </div>
      )}

      <CreateSpecialOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function DeliveryBadge({ method }: { method: "PICKUP" | "SHIPPING" }) {
  return method === "PICKUP" ? (
    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
      Recogida
    </Badge>
  ) : (
    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/20">
      Envío
    </Badge>
  )
}

function StatusBadge({ status }: { status: SpecialOrderStatus }) {
  const map: Record<SpecialOrderStatus, { label: string; className: string }> = {
    PENDING: { label: "Pendiente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20" },
    RECEIVED: { label: "Recibido", className: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" },
    SHIPPED: { label: "Enviado", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20" },
    DELIVERED: { label: "Entregado", className: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20" },
    CANCELLED: { label: "Cancelado", className: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20" },
  }
  const { label, className } = map[status]
  return <Badge className={className}>{label}</Badge>
}

function PaymentStatusBadge({ status }: { status: "PAID" | "PENDING" }) {
  return status === "PAID" ? (
    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 text-xs">
      Pagado
    </Badge>
  ) : (
    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-xs">
      Pendiente
    </Badge>
  )
}
