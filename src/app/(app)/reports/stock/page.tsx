"use client"

import Link from "next/link"
import { ArrowLeft, Boxes, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useStockValue } from "@/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/format"

export default function StockReportPage() {
  const { data: stockValue, isLoading } = useStockValue()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Valor de stock</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Package className="size-4 text-amber-500" />
              Total unidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              {formatNumber(stockValue?.totalItems ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Boxes className="size-4 text-primary" />
              Valor a PVP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(stockValue?.totalSaleValue ?? "0")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valoracion por producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {stockValue?.products.map((p) => (
              <div
                key={p.productId}
                className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{p.productName}</p>
                  <Badge variant="secondary" className="mt-0.5">
                    {p.stock} uds
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(p.saleValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Coste: {formatCurrency(p.costValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
