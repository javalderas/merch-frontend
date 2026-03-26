"use client"

import { useState, useMemo } from "react"
import { Plus, Wallet, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { EmptyState } from "@/components/ui/empty-state"
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog"
import { useExpenses, useCreateExpense, useDeleteExpense } from "@/hooks/use-expenses"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ExpenseFormValues } from "@/lib/validations/expense-schema"
import type { ExpenseCategory } from "@/types/expense"
import { Trash2 } from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCTION: "Produccion",
  TRANSPORT: "Transporte",
  VENUE: "Local",
  MARKETING: "Marketing",
  OTHER: "Otro",
}

type CategoryFilter = "ALL" | ExpenseCategory

const CATEGORY_PILLS: { label: string; value: CategoryFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Producción", value: "PRODUCTION" },
  { label: "Transporte", value: "TRANSPORT" },
  { label: "Local", value: "VENUE" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Otro", value: "OTHER" },
]

const pillBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap"
const pillActive = "bg-primary text-primary-foreground border-primary"
const pillInactive =
  "bg-muted/40 text-muted-foreground hover:text-foreground border-border"

function getCurrentMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  }
}

export default function ExpensesPage() {
  const { data: expenses, isLoading, error, refetch } = useExpenses()
  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense()
  const [dialogOpen, setDialogOpen] = useState(false)

  const defaultRange = getCurrentMonthRange()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL")
  const [dateFrom, setDateFrom] = useState(defaultRange.from)
  const [dateTo, setDateTo] = useState(defaultRange.to)

  function handleCreate(values: ExpenseFormValues) {
    createExpense.mutate(
      {
        description: values.description,
        amount: values.amount.toString(),
        category: values.category,
        date: values.date,
      },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  const filteredExpenses = useMemo(() => {
    if (!expenses) return []
    const q = search.trim().toLowerCase()
    return expenses.filter((e) => {
      if (q && !e.description.toLowerCase().includes(q)) return false
      if (categoryFilter !== "ALL" && e.category !== categoryFilter) return false
      const expenseDate = e.date.slice(0, 10)
      if (dateFrom && expenseDate < dateFrom) return false
      if (dateTo && expenseDate > dateTo) return false
      return true
    })
  }, [expenses, search, categoryFilter, dateFrom, dateTo])

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gastos</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 min-h-[44px]"
            placeholder="Buscar por descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category pills */}
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
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">Desde</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="min-h-[44px] w-auto"
          />
          <span className="text-sm text-muted-foreground shrink-0">Hasta</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="min-h-[44px] w-auto"
          />
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground">
          {filteredExpenses.length}{" "}
          {filteredExpenses.length === 1 ? "gasto" : "gastos"} · {formatCurrency(totalFiltered)}
        </p>
      </div>

      {expenses?.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No hay gastos"
          description="Registra los gastos de la banda para controlar los beneficios"
        />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin resultados"
          description="No hay gastos que coincidan con los filtros aplicados"
        />
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium">{expense.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[expense.category] ?? expense.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-destructive">
                    -{formatCurrency(expense.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteExpense.mutate(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createExpense.isPending}
      />
    </div>
  )
}
