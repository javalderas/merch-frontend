"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getStockMovements, createStockMovement } from "@/lib/api/stock-movement-api"
import { extractErrorDetail } from "@/lib/api/error-utils"
import { useAuth } from "@/contexts/auth-context"
import type { CreateStockMovementRequest } from "@/types/stock-movement"

export function useStockMovements(productId: string) {
  return useQuery({
    queryKey: ["stock-movements", productId],
    queryFn: () => getStockMovements(productId),
  })
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: CreateStockMovementRequest }) =>
      createStockMovement(productId, data, actor),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements", productId] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products", productId] })
      toast.success("Stock ajustado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}
