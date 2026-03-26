"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense-schema"
import type { Expense } from "@/types/expense"

const categoryOptions = [
  { value: "PRODUCTION", label: "Produccion" },
  { value: "TRANSPORT", label: "Transporte" },
  { value: "VENUE", label: "Local" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OTHER", label: "Otro" },
] as const

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense
  onSubmit: (values: ExpenseFormValues) => void
  isPending?: boolean
}

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
  isPending,
}: ExpenseFormDialogProps) {
  const setOpen = onOpenChange
  const isEditing = !!expense

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: expense?.description ?? "",
      amount: expense ? Number(expense.amount) : 0,
      category: expense?.category ?? "OTHER",
      date: expense?.date?.split("T")[0] ?? todayISO(),
    },
  })

  // Reset form when expense changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        description: expense?.description ?? "",
        amount: expense ? Number(expense.amount) : 0,
        category: expense?.category ?? "OTHER",
        date: expense?.date?.split("T")[0] ?? todayISO(),
      })
    }
  }, [open, expense, form])

  function handleSubmit(values: ExpenseFormValues) {
    onSubmit(values)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar gasto" : "Nuevo gasto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del gasto"
              : "Registra un nuevo gasto"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripcion del gasto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importe</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="min-h-[44px]">
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear gasto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
