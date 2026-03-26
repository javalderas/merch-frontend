"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Package, LayoutGrid, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { EmptyState } from "@/components/ui/empty-state"
import { ProductCard } from "@/components/products/product-card"
import { useProducts } from "@/hooks/use-products"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { ProductCategory } from "@/types/product"

const COL_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
type Cols = (typeof COL_OPTIONS)[number]

const colsClass: Record<Cols, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-4 sm:grid-cols-5",
  6: "grid-cols-4 sm:grid-cols-6",
  7: "grid-cols-4 sm:grid-cols-7",
  8: "grid-cols-4 sm:grid-cols-8",
  9: "grid-cols-4 sm:grid-cols-9",
  10: "grid-cols-4 sm:grid-cols-10",
}

type CategoryFilter = "ALL" | ProductCategory
type StockFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"

const CATEGORY_PILLS: { label: string; value: CategoryFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Ropa", value: "CLOTHING" },
  { label: "Música", value: "MUSIC" },
  { label: "Accesorios", value: "ACCESSORIES" },
  { label: "Otro", value: "OTHER" },
]

const STOCK_PILLS: { label: string; value: StockFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "En stock", value: "IN_STOCK" },
  { label: "Stock bajo (≤10)", value: "LOW_STOCK" },
  { label: "Sin stock", value: "OUT_OF_STOCK" },
]

const pillBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap"
const pillActive = "bg-primary text-primary-foreground border-primary"
const pillInactive =
  "bg-muted/40 text-muted-foreground hover:text-foreground border-border"

export default function ProductsPage() {
  const { data: products, isLoading, error, refetch } = useProducts()
  const router = useRouter()
  const [cols, setCols] = useState<Cols>(2)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL")
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL")

  const filteredProducts = useMemo(() => {
    if (!products) return []
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.sku?.toLowerCase().includes(q) ?? false) ||
          (p.description?.toLowerCase().includes(q) ?? false)
        if (!matches) return false
      }
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false
      if (stockFilter === "IN_STOCK" && p.stock <= 0) return false
      if (stockFilter === "LOW_STOCK" && (p.stock <= 0 || p.stock > 10)) return false
      if (stockFilter === "OUT_OF_STOCK" && p.stock > 0) return false
      return true
    })
  }, [products, search, categoryFilter, stockFilter])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />

  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "ALL" || stockFilter !== "ALL"

  function clearFilters() {
    setSearch("")
    setCategoryFilter("ALL")
    setStockFilter("ALL")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button asChild size="sm">
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Nuevo</span>
          </Link>
        </Button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 min-h-[44px]"
            placeholder="Buscar por nombre, SKU o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category + stock pills + clear */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setCategoryFilter(pill.value)}
              className={cn(pillBase, categoryFilter === pill.value ? pillActive : pillInactive)}
            >
              {pill.label}
            </button>
          ))}

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          {STOCK_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setStockFilter(pill.value)}
              className={cn(pillBase, stockFilter === pill.value ? pillActive : pillInactive)}
            >
              {pill.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid size control */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit max-w-full overflow-x-auto scrollbar-none">
        <LayoutGrid className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
        {COL_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setCols(n)}
            className={cn(
              "min-w-[28px] rounded px-2 py-1 text-xs font-medium transition-colors shrink-0",
              n > 4 && "hidden sm:block",
              cols === n
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`${n} columnas`}
          >
            {n}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && !hasActiveFilters ? (
        <EmptyState
          icon={Package}
          title="No hay productos"
          description="Crea tu primer producto para empezar a gestionar el merch"
          action={{ label: "Crear producto", href: "/products/new" }}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin resultados"
          description="No hay productos que coincidan con los filtros aplicados"
        />
      ) : (
        <div className={cn("grid gap-4", colsClass[cols])}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => router.push(`/products/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
