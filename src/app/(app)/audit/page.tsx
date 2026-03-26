"use client"

import { ShieldAlert, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useAuditLog } from "@/hooks/use-audit"
import { formatDateTime } from "@/lib/format"
import type { AuditEntry } from "@/types/audit"

const actionLabels: Record<string, string> = {
  "product.create": "Producto creado",
  "product.update": "Producto actualizado",
  "product.delete": "Producto eliminado",
  "sale.create": "Venta registrada",
  "expense.create": "Gasto registrado",
  "expense.update": "Gasto actualizado",
  "expense.delete": "Gasto eliminado",
  "stock.adjust": "Stock ajustado",
  "special-order.create": "Pedido especial creado",
  "special-order.status": "Estado de pedido actualizado",
  "special-order.paid": "Pedido marcado como pagado",
  "event.create": "Evento creado",
  "event.status": "Evento activado/desactivado",
  "event.delete": "Evento eliminado",
}

function actionBadgeVariant(action: string): string {
  if (action.startsWith("product.")) return "bg-blue-500/15 text-blue-400 border-blue-500/30"
  if (action.startsWith("sale.")) return "bg-green-500/15 text-green-400 border-green-500/30"
  if (action.startsWith("expense.")) return "bg-orange-500/15 text-orange-400 border-orange-500/30"
  if (action.startsWith("stock.")) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
  if (action.startsWith("special-order.")) return "bg-purple-500/15 text-purple-400 border-purple-500/30"
  if (action.startsWith("event.")) return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
  return "bg-muted text-muted-foreground border-border"
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap flex-shrink-0 ${actionBadgeVariant(entry.action)}`}
      >
        {actionLabels[entry.action] ?? entry.action}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{entry.userName}</p>
        {entry.targetName && (
          <p className="text-xs text-muted-foreground truncate">{entry.targetName}</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground flex-shrink-0">{formatDateTime(entry.createdAt)}</p>
    </div>
  )
}

export default function AuditPage() {
  const { can } = useAuth()
  const { data: log = [] } = useAuditLog()

  if (!can("audit:view")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-sm w-full">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Acceso restringido</p>
              <p className="text-sm text-muted-foreground">Solo administradores</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Registro de actividad</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          {log.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Activity className="h-8 w-8 opacity-40" />
              <p className="text-sm">Sin actividad registrada</p>
            </div>
          ) : (
            <div className="px-4">
              {log.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
