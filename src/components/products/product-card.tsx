"use client"

import { Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import type { Product, ProductCategory } from "@/types/product"

const categoryLabels: Record<ProductCategory, string> = {
  CLOTHING: "Ropa",
  MUSIC: "Musica",
  ACCESSORIES: "Accesorios",
  OTHER: "Otro",
}

const categoryColors: Record<ProductCategory, string> = {
  CLOTHING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MUSIC: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ACCESSORIES: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

function getStockColor(stock: number) {
  if (stock === 0) return "text-red-600 dark:text-red-400"
  if (stock <= 10) return "text-yellow-600 dark:text-yellow-400"
  return "text-green-600 dark:text-green-400"
}

interface ProductCardProps {
  product: Product
  onClick?: (product: Product) => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md active:shadow-sm",
        "min-h-[44px]"
      )}
      onClick={() => onClick?.(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.(product)
        }
      }}
    >
      {product.imageUrl ? (
        <div className="aspect-square w-full overflow-hidden rounded-t-xl">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-t-xl bg-muted">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <CardContent className="grid gap-1.5 p-3">
        <h3 className="font-medium leading-tight line-clamp-2 text-sm">{product.name}</h3>
        <Badge
          variant="secondary"
          className={cn("w-fit border-0 text-xs px-1.5 py-0", categoryColors[product.category])}
        >
          {categoryLabels[product.category]}
        </Badge>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <span className="font-bold text-base leading-none">{formatCurrency(product.salePrice)}</span>
          <span className={cn("text-xs font-medium shrink-0", getStockColor(product.stock))}>
            {product.stock} uds.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
