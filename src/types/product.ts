export type ProductCategory = "CLOTHING" | "MUSIC" | "ACCESSORIES" | "OTHER"

export interface Product {
  id: string
  name: string
  description: string | null
  category: ProductCategory
  sku: string | null
  barcode: string | null
  imageUrl: string | null
  purchasePrice: string
  salePrice: string
  stock: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  category: ProductCategory
  sku?: string
  barcode?: string
  imageUrl?: string | null
  purchasePrice?: string
  salePrice: string
  stock?: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  category?: ProductCategory
  sku?: string
  barcode?: string
  imageUrl?: string | null
  purchasePrice?: string
  salePrice?: string
}
