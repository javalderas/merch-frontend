"use client"

import { useState, useMemo } from "react"
import { Receipt, Eye, EyeOff, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { EmptyState } from "@/components/ui/empty-state"
import { SaleTable } from "@/components/sales/sale-table"
import { useSales } from "@/hooks/use-sales"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/types/sale"

type PaymentFilter = "ALL" | PaymentMethod

const PAYMENT_PILLS: { label: string; value: PaymentFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Efectivo", value: "CASH" },
  { label: "Tarjeta", value: "CARD" },
  { label: "Bizum", value: "BIZUM" },
]

const pillBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap"
const pillActive = "bg-primary text-primary-foreground border-primary"
const pillInactive =
  "bg-muted/40 text-muted-foreground hover:text-foreground border-border"

function getCurrentMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  }
}

export default function SalesPage() {
  const { data: sales, isLoading, error, refetch } = useSales()
  const { can } = useAuth()
  const [showSeller, setShowSeller] = useState(false)

  const defaultRange = getCurrentMonthRange()
  const [dateFrom, setDateFrom] = useState(defaultRange.from)
  const [dateTo, setDateTo] = useState(defaultRange.to)
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL")

  const filteredSales = useMemo(() => {
    if (!sales) return []
    return sales.filter((sale) => {
      if (paymentFilter !== "ALL" && sale.paymentMethod !== paymentFilter) return false
      const saleDate = sale.createdAt.slice(0, 10)
      if (dateFrom && saleDate < dateFrom) return false
      if (dateTo && saleDate > dateTo) return false
      return true
    })
  }, [sales, paymentFilter, dateFrom, dateTo])

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)
  const count = filteredSales.length

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Historial de ventas</h1>
        {can("sales:view_seller") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSeller((v) => !v)}
            className="gap-1.5"
          >
            {showSeller ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {showSeller ? "Ocultar vendedor" : "Ver vendedor"}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">Desde</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="min-h-[44px] w-auto"
          />
          <span className="text-sm text-muted-foreground shrink-0">Hasta</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="min-h-[44px] w-auto"
          />
        </div>

        {/* Payment method pills */}
        <div className="flex flex-wrap items-center gap-2">
          {PAYMENT_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setPaymentFilter(pill.value)}
              className={cn(pillBase, paymentFilter === pill.value ? pillActive : pillInactive)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Summary bar */}
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? "venta" : "ventas"} · {formatCurrency(totalRevenue)}
        </p>
      </div>

      {sales?.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No hay ventas"
          description="Las ventas que registres desde el POS apareceran aqui"
        />
      ) : filteredSales.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin resultados"
          description="No hay ventas que coincidan con los filtros aplicados"
        />
      ) : (
        <SaleTable sales={filteredSales} showSeller={showSeller} />
      )}
    </div>
  )
}
