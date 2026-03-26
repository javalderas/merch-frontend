"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useReportSummary } from "@/hooks/use-reports"
import { formatCurrency } from "@/lib/format"

export default function SummaryReportPage() {
  const { data: summary, isLoading } = useReportSummary()

  if (isLoading) return <LoadingSpinner />

  const profit = Number(summary?.profit ?? 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Resumen financiero</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-green-500" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(summary?.totalRevenue ?? "0")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.salesCount ?? 0} ventas
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              <TrendingDown className="size-4 text-red-500" />
              Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(summary?.totalExpenses ?? "0")}
            </p>
          </CardContent>
        </Card>
      </div>

      {Number(summary?.pendingSpecialOrdersIncome ?? 0) > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              <ClipboardList className="size-4 text-amber-500" />
              Pedidos pendientes de cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              {formatCurrency(summary?.pendingSpecialOrdersIncome ?? "0")}
            </p>
          </CardContent>
        </Card>
      )}

      <Card
        className={
          profit >= 0
            ? "border-primary/40 bg-primary/5"
            : "border-red-500/40 bg-red-500/5"
        }
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="size-4 text-primary" />
            Beneficio neto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={
              profit >= 0
                ? "text-4xl font-bold text-primary"
                : "text-4xl font-bold text-red-500"
            }
          >
            {formatCurrency(summary?.profit ?? "0")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {summary?.salesCount ?? 0} ventas registradas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
