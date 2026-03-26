"use client"

import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import type { Product, ProductCategory } from "@/types/product"

interface ProductDetailViewProps {
  product: Product
}

const categoryLabels: Record<ProductCategory, string> = {
  CLOTHING: "Ropa",
  MUSIC: "Música",
  ACCESSORIES: "Accesorios",
  OTHER: "Otro",
}

function stockColor(stock: number): string {
  if (stock === 0) return "text-red-500"
  if (stock <= 10) return "text-yellow-500"
  return "text-green-500"
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <div className="space-y-5">
      {/* Image */}
      <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>

      {/* Name + category */}
      <div className="flex items-start gap-3">
        <h2 className="text-2xl font-bold leading-tight flex-1">{product.name}</h2>
        <Badge variant="secondary" className="shrink-0 mt-1">
          {categoryLabels[product.category]}
        </Badge>
      </div>

      {/* Prices */}
      <div className="space-y-1">
        <p className="text-3xl font-bold">{formatCurrency(product.salePrice)}</p>
        {product.purchasePrice && (
          <p className="text-sm text-muted-foreground">
            Precio de compra:{" "}
            <span className="font-medium">{formatCurrency(product.purchasePrice)}</span>
          </p>
        )}
      </div>

      {/* Stock */}
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold tabular-nums ${stockColor(product.stock)}`}>
          {product.stock}
        </span>
        <span className="text-sm text-muted-foreground">unidades</span>
      </div>

      {/* Secondary info: SKU / barcode */}
      {(product.sku || product.barcode) && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {product.sku && (
            <div className="space-y-0.5">
              <p className="text-muted-foreground uppercase tracking-wide text-xs font-medium">SKU</p>
              <p className="font-mono">{product.sku}</p>
            </div>
          )}
          {product.barcode && (
            <div className="space-y-0.5">
              <p className="text-muted-foreground uppercase tracking-wide text-xs font-medium">Código de barras</p>
              <p className="font-mono">{product.barcode}</p>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
      )}
    </div>
  )
}
