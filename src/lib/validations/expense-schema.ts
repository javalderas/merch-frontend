import { z } from "zod"

export const expenseSchema = z.object({
  description: z.string().min(1, "La descripcion es obligatoria"),
  amount: z.number().positive("El importe debe ser mayor que 0"),
  category: z.enum(["PRODUCTION", "TRANSPORT", "VENUE", "MARKETING", "OTHER"]),
  date: z.string().min(1, "La fecha es obligatoria"),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
