"use client"

import Link from "next/link"
import { ShoppingCart, Package, AlertTriangle, TrendingUp, CalendarDays, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useProducts } from "@/hooks/use-products"
import { useReportSummary } from "@/hooks/use-reports"
import { useTodaySales } from "@/hooks/use-events"
import { formatCurrency } from "@/lib/format"

export default function DashboardPage() {
  const { data: products, isLoading: loadingProducts } = useProducts()
  const { data: summary, isLoading: loadingSummary } = useReportSummary()
  const { data: todayData, isLoading: loadingToday } = useTodaySales()

  if (loadingProducts || loadingSummary || loadingToday) return <LoadingSpinner />

  const lowStockProducts = products?.filter((p) => p.stock <= 5) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/pos">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nueva venta
          </Link>
        </Button>
      </div>

      {/* Today hero card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  Ventas hoy
                </span>
                {todayData?.eventName && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {todayData.eventName}
                  </Badge>
                )}
              </div>
              <p className="text-5xl font-bold tracking-tight">
                {formatCurrency(todayData?.total ?? "0")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {todayData?.count ?? 0}{" "}
                {(todayData?.count ?? 0) === 1 ? "venta" : "ventas"}
                {!todayData?.eventName && (
                  <span className="ml-2 text-muted-foreground/60">· Sin evento activo —{" "}
                    <Link href="/events" className="underline underline-offset-2 hover:text-foreground transition-colors">
                      activar evento
                    </Link>
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 mt-1">
              <Link href="/pos">
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Vender
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary?.totalRevenue ?? "0")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary?.totalExpenses ?? "0")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Beneficio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(summary?.profit ?? "0")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.salesCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Stock bajo ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between py-2 hover:bg-muted/50 rounded px-2 -mx-2"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{product.name}</span>
                  </div>
                  <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                    {product.stock} uds
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" asChild className="h-auto py-4">
          <Link href="/products/new" className="flex flex-col items-center gap-2">
            <Package className="h-6 w-6" />
            <span>Nuevo producto</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-4">
          <Link href="/reports" className="flex flex-col items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Ver informes</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
