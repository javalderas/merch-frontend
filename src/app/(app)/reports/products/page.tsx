"use client"

import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useTopProducts } from "@/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/format"

export default function ProductsReportPage() {
  const { data: topProducts, isLoading } = useTopProducts()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Top productos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" />
            Productos más vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!topProducts?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay datos de ventas todavía
            </p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span
                    className={
                      index === 0
                        ? "text-xl font-black text-amber-500 w-7 text-center"
                        : index === 1
                          ? "text-xl font-black text-slate-400 w-7 text-center"
                          : index === 2
                            ? "text-xl font-black text-amber-700 w-7 text-center"
                            : "text-base font-bold text-muted-foreground w-7 text-center"
                    }
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(product.quantitySold)} uds vendidas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(product.revenue)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {formatNumber(product.quantitySold)} uds
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
