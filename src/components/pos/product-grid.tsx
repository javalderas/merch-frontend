"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import type { Product } from "@/types/product"

const colsClass: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-4 lg:grid-cols-6",
  7: "grid-cols-4 lg:grid-cols-7",
  8: "grid-cols-4 lg:grid-cols-8",
  9: "grid-cols-4 lg:grid-cols-9",
  10: "grid-cols-4 lg:grid-cols-10",
}

interface ProductGridProps {
  products: Product[]
  onAddItem: (product: Product) => void
  cols?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

export function ProductGrid({ products, onAddItem, cols = 3 }: ProductGridProps) {
  return (
    <div className={cn("grid gap-3", colsClass[cols])}>
      {products.map((product) => {
        const isOutOfStock = product.stock === 0

        return (
          <Card
            key={product.id}
            className={cn(
              "cursor-pointer select-none transition-all active:scale-95",
              isOutOfStock
                ? "opacity-40 cursor-not-allowed"
                : "hover:shadow-md hover:border-primary/40"
            )}
            onClick={() => {
              if (!isOutOfStock) onAddItem(product)
            }}
            role="button"
            tabIndex={isOutOfStock ? -1 : 0}
            aria-disabled={isOutOfStock}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isOutOfStock) {
                e.preventDefault()
                onAddItem(product)
              }
            }}
          >
            {product.imageUrl && (
              <div
                className={cn(
                  "w-full overflow-hidden rounded-t-xl",
                  cols >= 4 ? "aspect-square" : "aspect-[4/3]"
                )}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardContent
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-center",
                product.imageUrl ? "p-2" : "min-h-[100px] p-3",
                cols >= 4 && "p-2"
              )}
            >
              <span
                className={cn(
                  "font-medium leading-tight line-clamp-2",
                  cols >= 4 ? "text-xs" : "text-sm"
                )}
              >
                {product.name}
              </span>
              <span className={cn("font-bold", cols >= 4 ? "text-base" : "text-xl")}>
                {formatCurrency(product.salePrice)}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isOutOfStock
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                )}
              >
                {isOutOfStock ? "Sin stock" : `${product.stock} uds.`}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
