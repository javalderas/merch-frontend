"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { Sale, PaymentMethod } from "@/types/sale"

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  BIZUM: "Bizum",
}

const paymentMethodVariant: Record<PaymentMethod, "default" | "secondary" | "outline"> = {
  CASH: "secondary",
  CARD: "default",
  BIZUM: "outline",
}

interface SaleTableProps {
  sales: Sale[]
  showSeller?: boolean
}

export function SaleTable({ sales, showSeller = false }: SaleTableProps) {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          {showSeller && <TableHead>Vendedor</TableHead>}
          <TableHead className="text-center">Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-center">Metodo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow
            key={sale.id}
            className="cursor-pointer"
            onClick={() => router.push(`/sales/${sale.id}`)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                router.push(`/sales/${sale.id}`)
              }
            }}
          >
            <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
            {showSeller && (
              <TableCell className="text-sm text-muted-foreground">
                {sale.sellerName ?? "—"}
              </TableCell>
            )}
            <TableCell className="text-center">{sale.items.length}</TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(sale.total)}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant={paymentMethodVariant[sale.paymentMethod]}>
                {paymentMethodLabels[sale.paymentMethod]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
