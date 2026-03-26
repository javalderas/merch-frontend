"use client"

import { ProductForm } from "@/components/products/product-form"
import { useCreateProduct } from "@/hooks/use-products"
import type { ProductFormValues } from "@/lib/validations/product-schema"

export default function NewProductPage() {
  const createProduct = useCreateProduct()

  function handleSubmit(values: ProductFormValues) {
    createProduct.mutate({
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      sku: values.sku || undefined,
      barcode: values.barcode || undefined,
      imageUrl: values.imageUrl ?? null,
      purchasePrice: values.purchasePrice?.toString(),
      salePrice: values.salePrice.toString(),
      stock: values.stock,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <ProductForm onSubmit={handleSubmit} isPending={createProduct.isPending} />
    </div>
  )
}
