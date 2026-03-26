"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/product-api"
import { extractErrorDetail } from "@/lib/api/error-utils"
import { useAuth } from "@/contexts/auth-context"
import type { CreateProductRequest, UpdateProductRequest } from "@/types/product"

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProduct(id),
  })
}

export function useCreateProduct() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data, actor),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Producto creado")
      router.push(`/products/${data.id}`)
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      updateProduct(id, data, actor),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products", id] })
      toast.success("Producto actualizado")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}

export function useDeleteProduct() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const actor = { userId: user.id, userName: user.name }

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Producto eliminado")
      router.push("/products")
    },
    onError: (error) => {
      toast.error(extractErrorDetail(error).detail)
    },
  })
}
