import { z } from "zod"

const specialOrderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "El nombre del producto es obligatorio"),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  unitPrice: z.number().min(0, "El precio no puede ser negativo"),
})

export const createSpecialOrderSchema = z
  .object({
    customerName: z.string().min(1, "El nombre del cliente es obligatorio"),
    customerPhone: z.string().optional(),
    items: z.array(specialOrderItemSchema).min(1, "Añade al menos un producto"),
    deliveryMethod: z.enum(["PICKUP", "SHIPPING"]),
    shippingAddress: z.string().optional(),
    shippingCost: z.number().min(0).optional(),
    paymentMethod: z.enum(["CASH", "CARD", "BIZUM", "COD"]),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "SHIPPING" && !data.shippingAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La dirección de envío es obligatoria",
        path: ["shippingAddress"],
      })
    }
    if (data.paymentMethod === "COD" && data.deliveryMethod !== "SHIPPING") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contrareembolso solo es válido para envío por paquetería",
        path: ["paymentMethod"],
      })
    }
  })

export type CreateSpecialOrderFormValues = z.infer<typeof createSpecialOrderSchema>
