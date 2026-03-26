"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { useSale } from "@/hooks/use-sales"
import { formatCurrency, formatDateTime } from "@/lib/format"

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  BIZUM: "Bizum",
}

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: sale, isLoading, error, refetch } = useSale(id)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />
  if (!sale) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalle de venta</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {formatDateTime(sale.createdAt)}
            </CardTitle>
            <Badge>{PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {sale.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-lg font-bold">Total</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(sale.total)}</p>
          </div>

          {sale.notes && (
            <p className="text-sm text-muted-foreground">
              Notas: {sale.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
