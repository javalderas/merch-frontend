"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getExpenses, createExpense, updateExpense, deleteExpense } from "@/lib/api/expense-api"
import { extractErrorDetail } from "@/lib/api/error-utils"
import { useAuth } from "@/contexts/auth-context"
import type { CreateExpenseRequest, UpdateExpenseRequest } from "@/types/expense"

export function useExpenses(dateFrom?: string, dateTo?: string, category?: string) {
  return useQuery({
    queryKey: ["expenses", dateFrom, dateTo, category],
    queryFn: () => getExpenses(dateFrom, dateTo, category),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Gasto registrado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      updateExpense(id, data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Gasto actualizado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Gasto eliminado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}
