import * as store from "./mock-store"
import type { SpecialOrder, SpecialOrderStatus, CreateSpecialOrderRequest } from "@/types/special-order"

type Actor = { userId: string; userName: string }
const defaultActor: Actor = { userId: "unknown", userName: "Sistema" }

export async function getSpecialOrders(status?: SpecialOrderStatus): Promise<SpecialOrder[]> {
  return store.getSpecialOrders(status)
}

export async function getSpecialOrder(id: string): Promise<SpecialOrder> {
  return store.getSpecialOrder(id)
}

export async function createSpecialOrder(
  data: CreateSpecialOrderRequest,
  sellerName: string,
  actor: Actor = defaultActor
): Promise<SpecialOrder> {
  return store.createSpecialOrder(data, sellerName, actor)
}

export async function updateSpecialOrderStatus(
  id: string,
  status: SpecialOrderStatus,
  actor: Actor = defaultActor
): Promise<SpecialOrder> {
  return store.updateSpecialOrderStatus(id, status, actor)
}

export async function markSpecialOrderPaid(id: string, actor: Actor = defaultActor): Promise<SpecialOrder> {
  return store.markSpecialOrderPaid(id, actor)
}
