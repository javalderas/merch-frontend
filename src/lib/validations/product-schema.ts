import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional().or(z.literal("")),
  category: z.enum(["CLOTHING", "MUSIC", "ACCESSORIES", "OTHER"]),
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  purchasePrice: z.number().min(0, "El precio de compra no puede ser negativo").optional(),
  salePrice: z.number().min(0.01, "El precio de venta es obligatorio"),
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional(),
  imageUrl: z.string().nullable().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
