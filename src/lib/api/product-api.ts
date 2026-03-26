import * as store from "./mock-store"
import type { Product, CreateProductRequest, UpdateProductRequest } from "@/types/product"

// TODO: Replace mock-store calls with real API calls when backend is ready
// import { apiClient } from "./client"

type Actor = { userId: string; userName: string }
const defaultActor: Actor = { userId: "unknown", userName: "Sistema" }

export async function getProducts(category?: string): Promise<Product[]> {
  return store.getProducts(category)
}

export async function getProduct(id: string): Promise<Product> {
  return store.getProduct(id)
}

export async function createProduct(data: CreateProductRequest, actor: Actor = defaultActor): Promise<Product> {
  return store.createProduct(data, actor)
}

export async function updateProduct(id: string, data: UpdateProductRequest, actor: Actor = defaultActor): Promise<Product> {
  return store.updateProduct(id, data, actor)
}

export async function deleteProduct(id: string, actor: Actor = defaultActor): Promise<void> {
  return store.deleteProduct(id, actor)
}

export async function uploadProductImage(id: string, _file: File): Promise<Product> {
  // Mock: just return the product as-is (no real upload)
  return store.getProduct(id)
}
