"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getSales, getSale, createSale } from "@/lib/api/sale-api"
import { extractErrorDetail } from "@/lib/api/error-utils"
import { useAuth } from "@/contexts/auth-context"
import type { CreateSaleRequest } from "@/types/sale"

export function useSales(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["sales", dateFrom, dateTo],
    queryFn: () => getSales(dateFrom, dateTo),
  })
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => getSale(id),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: (data: CreateSaleRequest) => createSale(data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Venta registrada")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}
