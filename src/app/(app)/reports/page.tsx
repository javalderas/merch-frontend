"use client"

import Link from "next/link"
import { TrendingUp, ShoppingBag, Boxes } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const reports = [
  {
    href: "/reports/summary",
    icon: TrendingUp,
    title: "Resumen financiero",
    description: "Ingresos, gastos y beneficio neto del periodo",
    color: "text-green-500",
    bg: "bg-green-500/10 hover:bg-green-500/15",
    border: "border-green-500/20 hover:border-green-500/40",
  },
  {
    href: "/reports/products",
    icon: ShoppingBag,
    title: "Top productos",
    description: "Los productos más vendidos y su facturación",
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/15",
    border: "border-primary/20 hover:border-primary/40",
  },
  {
    href: "/reports/stock",
    icon: Boxes,
    title: "Valor de stock",
    description: "Inventario actual valorado a PVP y coste",
    color: "text-amber-500",
    bg: "bg-amber-500/10 hover:bg-amber-500/15",
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Informes</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {reports.map(({ href, icon: Icon, title, description, color, bg, border }) => (
          <Link key={href} href={href}>
            <Card
              className={cn(
                "cursor-pointer transition-all h-full border-2",
                bg,
                border
              )}
            >
              <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[200px]">
                <div className={cn("rounded-2xl p-4", bg)}>
                  <Icon className={cn("size-10", color)} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
