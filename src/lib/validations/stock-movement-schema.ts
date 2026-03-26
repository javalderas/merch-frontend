import { z } from "zod"

export const stockMovementSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().int().positive("La cantidad debe ser mayor que 0"),
  reason: z.string().min(1, "El motivo es obligatorio"),
})

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>
