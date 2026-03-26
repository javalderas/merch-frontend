"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getSpecialOrders,
  getSpecialOrder,
  createSpecialOrder,
  updateSpecialOrderStatus,
  markSpecialOrderPaid,
} from "@/lib/api/special-order-api"
import { extractErrorDetail } from "@/lib/api/error-utils"
import { useAuth } from "@/contexts/auth-context"
import type { SpecialOrderStatus, CreateSpecialOrderRequest } from "@/types/special-order"

export function useSpecialOrders(status?: SpecialOrderStatus) {
  return useQuery({
    queryKey: ["special-orders", status],
    queryFn: () => getSpecialOrders(status),
  })
}

export function useSpecialOrder(id: string) {
  return useQuery({
    queryKey: ["special-orders", id],
    queryFn: () => getSpecialOrder(id),
  })
}

export function useCreateSpecialOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: ({ data, sellerName }: { data: CreateSpecialOrderRequest; sellerName: string }) =>
      createSpecialOrder(data, sellerName, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-orders"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Pedido especial creado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}

export function useUpdateSpecialOrderStatus() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SpecialOrderStatus }) =>
      updateSpecialOrderStatus(id, status, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-orders"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Estado actualizado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}

export function useMarkSpecialOrderPaid() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: (id: string) => markSpecialOrderPaid(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["special-orders"] })
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      toast.success("Pedido marcado como pagado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}
