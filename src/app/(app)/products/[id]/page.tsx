"use client"

import { use, useState } from "react"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { ProductForm } from "@/components/products/product-form"
import { ProductDetailView } from "@/components/products/product-detail-view"
import { StockAdjustmentDialog } from "@/components/products/stock-adjustment-dialog"
import { useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products"
import { useStockMovements, useCreateStockMovement } from "@/hooks/use-stock-movements"
import { useSpecialOrders } from "@/hooks/use-special-orders"
import { useAuth } from "@/contexts/auth-context"
import { formatDateTime } from "@/lib/format"
import type { ProductFormValues } from "@/lib/validations/product-schema"
import type { StockMovementFormValues } from "@/lib/validations/stock-movement-schema"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { can } = useAuth()

  const { data: product, isLoading, error, refetch } = useProduct(id)
  const { data: movements } = useStockMovements(id)
  const { data: allSpecialOrders } = useSpecialOrders()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const createMovement = useCreateStockMovement()

  const pendingSpecialOrdersCount = (allSpecialOrders ?? []).filter(
    (o) =>
      (o.status === "PENDING" || o.status === "RECEIVED") &&
      o.items.some((item) => item.productId === id)
  ).length

  const [editing, setEditing] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)

  const canEdit = can("products:edit")
  const canDelete = can("products:delete")

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />
  if (!product) return null

  function handleUpdate(values: ProductFormValues) {
    updateProduct.mutate(
      {
        id,
        data: {
          name: values.name,
          description: values.description || undefined,
          category: values.category,
          sku: values.sku || undefined,
          barcode: values.barcode || undefined,
          imageUrl: values.imageUrl ?? null,
          purchasePrice: values.purchasePrice?.toString(),
          salePrice: values.salePrice.toString(),
        },
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  function handleStockAdjustment(values: StockMovementFormValues) {
    createMovement.mutate(
      { productId: id, data: values },
      { onSuccess: () => setStockDialogOpen(false) }
    )
  }

  function handleDelete() {
    deleteProduct.mutate(id)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 min-h-[44px] min-w-[44px]"
          onClick={() => router.push("/products")}
          aria-label="Volver a productos"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 truncate">{product.name}</h1>
        {canEdit && !editing && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 min-h-[44px] gap-2"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {editing ? (
        /* ── Edit mode ── */
        <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-4 space-y-4">
          {/* Admin badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-500/80 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
              Modo administrador
            </span>
          </div>

          {/* Edit form (no submit button inside — we add Guardar/Cancelar outside) */}
          <ProductForm
            product={product}
            onSubmit={handleUpdate}
            isPending={updateProduct.isPending}
          />

          {/* Stock section inside edit mode */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Stock actual</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => setStockDialogOpen(true)}
              >
                Ajustar stock
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {product.stock}{" "}
                <span className="text-sm font-normal text-muted-foreground">unidades</span>
              </p>
              {pendingSpecialOrdersCount > 0 && (
                <p className="text-xs text-amber-400 mt-1">
                  {pendingSpecialOrdersCount} pedido{pendingSpecialOrdersCount > 1 ? "s" : ""} especial{pendingSpecialOrdersCount > 1 ? "es" : ""} pendiente{pendingSpecialOrdersCount > 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Cancel */}
          <Button
            variant="ghost"
            className="w-full min-h-[44px]"
            onClick={() => setEditing(false)}
            disabled={updateProduct.isPending}
          >
            Cancelar
          </Button>

          {/* Delete — destructive, admin only */}
          {canDelete && (
            <Button
              variant="destructive"
              className="w-full min-h-[44px] gap-2"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {deleteProduct.isPending ? "Eliminando..." : "Eliminar producto"}
            </Button>
          )}
        </div>
      ) : (
        /* ── Read-only view ── */
        <>
          <ProductDetailView product={product} />

          {/* Stock section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Stock actual</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => setStockDialogOpen(true)}
              >
                Ajustar stock
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {product.stock}{" "}
                <span className="text-sm font-normal text-muted-foreground">unidades</span>
              </p>
              {pendingSpecialOrdersCount > 0 && (
                <p className="text-xs text-amber-400 mt-1">
                  {pendingSpecialOrdersCount} pedido{pendingSpecialOrdersCount > 1 ? "s" : ""} especial{pendingSpecialOrdersCount > 1 ? "es" : ""} pendiente{pendingSpecialOrdersCount > 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Stock movements history — always visible */}
      {movements && movements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2 text-sm border-b border-border last:border-0"
                >
                  <div>
                    <Badge
                      variant={
                        m.type === "IN"
                          ? "default"
                          : m.type === "OUT"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {m.type === "IN" ? "Entrada" : m.type === "OUT" ? "Salida" : "Ajuste"}
                    </Badge>
                    <span className="ml-2 text-muted-foreground">{m.reason}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      {m.type === "OUT" ? "-" : "+"}
                      {m.quantity}
                    </span>
                    <p className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StockAdjustmentDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        onSubmit={handleStockAdjustment}
        isPending={createMovement.isPending}
      />
    </div>
  )
}
