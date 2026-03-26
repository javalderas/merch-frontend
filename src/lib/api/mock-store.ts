import type { Product } from "@/types/product"
import type { Sale } from "@/types/sale"
import type { Expense } from "@/types/expense"
import type { StockMovement } from "@/types/stock-movement"
import type { SpecialOrder, SpecialOrderStatus, CreateSpecialOrderRequest } from "@/types/special-order"
import type { BandEvent, CreateEventRequest, EventStatus } from "@/types/event"
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_EXPENSES, MOCK_STOCK_MOVEMENTS, MOCK_SPECIAL_ORDERS } from "./mock-data"
import { logAction } from "./audit-store"

type Actor = { userId: string; userName: string }

// In-memory store — simulates a persistent backend.
// Data resets on page refresh. Replace with real API calls when backend is ready.

let products: Product[] = [...MOCK_PRODUCTS]
let sales: Sale[] = [...MOCK_SALES]
let expenses: Expense[] = [...MOCK_EXPENSES]
let stockMovements: StockMovement[] = [...MOCK_STOCK_MOVEMENTS]
let specialOrders: SpecialOrder[] = [...MOCK_SPECIAL_ORDERS]
let events: BandEvent[] = []

let idCounter = 1000

function nextId(): string {
  return `mock-${++idCounter}`
}

function now(): string {
  return new Date().toISOString()
}

// Simulated network delay
const DELAY = 300
function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, DELAY))
}

// --- Products ---

export async function getProducts(category?: string): Promise<Product[]> {
  await delay()
  if (category) {
    return products.filter((p) => p.category === category)
  }
  return [...products]
}

export async function getProduct(id: string): Promise<Product> {
  await delay()
  const product = products.find((p) => p.id === id)
  if (!product) throw new Error("Producto no encontrado")
  return { ...product }
}

export async function createProduct(data: Partial<Product>, actor: Actor): Promise<Product> {
  await delay()
  const product: Product = {
    id: nextId(),
    name: data.name || "",
    description: data.description || null,
    category: data.category || "OTHER",
    sku: data.sku || null,
    barcode: data.barcode || null,
    imageUrl: data.imageUrl || null,
    purchasePrice: data.purchasePrice || "0.00",
    salePrice: data.salePrice || "0.00",
    stock: data.stock || 0,
    createdAt: now(),
    updatedAt: now(),
  }
  products = [product, ...products]
  logAction({ userId: actor.userId, userName: actor.userName, action: "product.create", targetId: product.id, targetName: product.name })
  return { ...product }
}

export async function updateProduct(id: string, data: Partial<Product>, actor: Actor): Promise<Product> {
  await delay()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) throw new Error("Producto no encontrado")
  products[index] = { ...products[index], ...data, updatedAt: now() }
  logAction({ userId: actor.userId, userName: actor.userName, action: "product.update", targetId: id, targetName: products[index].name })
  return { ...products[index] }
}

export async function deleteProduct(id: string, actor: Actor): Promise<void> {
  await delay()
  const product = products.find((p) => p.id === id)
  products = products.filter((p) => p.id !== id)
  logAction({ userId: actor.userId, userName: actor.userName, action: "product.delete", targetId: id, targetName: product?.name })
}

// --- Stock Movements ---

export async function getStockMovements(productId: string): Promise<StockMovement[]> {
  await delay()
  return stockMovements.filter((m) => m.productId === productId)
}

export async function createStockMovement(
  productId: string,
  data: { type: string; quantity: number; reason?: string },
  actor: Actor
): Promise<StockMovement> {
  await delay()
  const productIndex = products.findIndex((p) => p.id === productId)
  if (productIndex === -1) throw new Error("Producto no encontrado")

  const movement: StockMovement = {
    id: nextId(),
    productId,
    type: data.type as StockMovement["type"],
    quantity: data.quantity,
    reason: data.reason || null,
    createdAt: now(),
  }
  stockMovements = [movement, ...stockMovements]

  // Update stock
  if (data.type === "IN") {
    products[productIndex].stock += data.quantity
  } else if (data.type === "OUT") {
    products[productIndex].stock -= data.quantity
  } else {
    products[productIndex].stock += data.quantity // ADJUSTMENT can be negative
  }

  logAction({ userId: actor.userId, userName: actor.userName, action: "stock.adjust", targetId: productId, targetName: products[productIndex].name })
  return { ...movement }
}

// --- Sales ---

export async function getSales(dateFrom?: string, dateTo?: string): Promise<Sale[]> {
  await delay()
  let result = [...sales]
  if (dateFrom) {
    result = result.filter((s) => s.createdAt >= dateFrom)
  }
  if (dateTo) {
    result = result.filter((s) => s.createdAt <= dateTo + "T23:59:59Z")
  }
  return result
}

export async function getSale(id: string): Promise<Sale> {
  await delay()
  const sale = sales.find((s) => s.id === id)
  if (!sale) throw new Error("Venta no encontrada")
  return { ...sale }
}

export async function createSale(data: {
  items: { productId: string; quantity: number }[]
  paymentMethod: string
  notes?: string
}, actor: Actor): Promise<Sale> {
  await delay()

  const saleItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`)

    // Decrement stock
    const productIndex = products.findIndex((p) => p.id === item.productId)
    products[productIndex].stock -= item.quantity

    const subtotal = (Number(product.salePrice) * item.quantity).toFixed(2)
    return {
      id: nextId(),
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.salePrice,
      subtotal,
    }
  })

  const total = saleItems.reduce((sum, item) => sum + Number(item.subtotal), 0).toFixed(2)

  const activeEvent = events.find((e) => e.status === "ACTIVE")

  const sale: Sale = {
    id: nextId(),
    items: saleItems,
    total,
    paymentMethod: data.paymentMethod as Sale["paymentMethod"],
    notes: data.notes || null,
    createdAt: now(),
    eventId: activeEvent?.id,
    eventName: activeEvent?.name,
  }
  sales = [sale, ...sales]
  logAction({ userId: actor.userId, userName: actor.userName, action: "sale.create", targetId: sale.id, targetName: `€${sale.total}` })
  return { ...sale }
}

// --- Expenses ---

export async function getExpenses(dateFrom?: string, dateTo?: string, category?: string): Promise<Expense[]> {
  await delay()
  let result = [...expenses]
  if (dateFrom) {
    result = result.filter((e) => e.date >= dateFrom)
  }
  if (dateTo) {
    result = result.filter((e) => e.date <= dateTo)
  }
  if (category) {
    result = result.filter((e) => e.category === category)
  }
  return result
}

export async function createExpense(data: {
  description: string
  amount: string
  category: string
  date: string
}, actor: Actor): Promise<Expense> {
  await delay()
  const expense: Expense = {
    id: nextId(),
    description: data.description,
    amount: data.amount,
    category: data.category as Expense["category"],
    date: data.date,
    createdAt: now(),
  }
  expenses = [expense, ...expenses]
  logAction({ userId: actor.userId, userName: actor.userName, action: "expense.create", targetId: expense.id, targetName: expense.description })
  return { ...expense }
}

export async function updateExpense(id: string, data: Partial<Expense>, actor: Actor): Promise<Expense> {
  await delay()
  const index = expenses.findIndex((e) => e.id === id)
  if (index === -1) throw new Error("Gasto no encontrado")
  expenses[index] = { ...expenses[index], ...data }
  logAction({ userId: actor.userId, userName: actor.userName, action: "expense.update", targetId: id, targetName: expenses[index].description })
  return { ...expenses[index] }
}

export async function deleteExpense(id: string, actor: Actor): Promise<void> {
  await delay()
  const expense = expenses.find((e) => e.id === id)
  expenses = expenses.filter((e) => e.id !== id)
  logAction({ userId: actor.userId, userName: actor.userName, action: "expense.delete", targetId: id, targetName: expense?.description })
}

// --- Reports ---

export async function getReportSummary(
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalRevenue: string
  totalExpenses: string
  profit: string
  salesCount: number
  specialOrdersRevenue: string
  pendingSpecialOrdersIncome: string
  period: { from: string; to: string }
}> {
  await delay()
  const filteredSales = await getSales(dateFrom, dateTo)
  const filteredExpenses = await getExpenses(dateFrom, dateTo)

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalExp = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const nonCancelledOrders = specialOrders.filter((o) => o.status !== "CANCELLED")
  const specialOrdersRevenue = nonCancelledOrders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.total), 0)
  const pendingSpecialOrdersIncome = nonCancelledOrders
    .filter((o) => o.paymentStatus === "PENDING")
    .reduce((sum, o) => sum + Number(o.total), 0)

  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalExpenses: totalExp.toFixed(2),
    profit: (totalRevenue - totalExp).toFixed(2),
    salesCount: filteredSales.length,
    specialOrdersRevenue: specialOrdersRevenue.toFixed(2),
    pendingSpecialOrdersIncome: pendingSpecialOrdersIncome.toFixed(2),
    period: {
      from: dateFrom || "2026-01-01",
      to: dateTo || new Date().toISOString().split("T")[0],
    },
  }
}

export async function getTopProducts(
  dateFrom?: string,
  dateTo?: string,
  limit = 10
): Promise<{ productId: string; productName: string; quantitySold: number; revenue: string }[]> {
  await delay()
  const filteredSales = await getSales(dateFrom, dateTo)

  const productMap = new Map<string, { productName: string; quantitySold: number; revenue: number }>()

  for (const sale of filteredSales) {
    for (const item of sale.items) {
      const existing = productMap.get(item.productId) || {
        productName: item.productName,
        quantitySold: 0,
        revenue: 0,
      }
      existing.quantitySold += item.quantity
      existing.revenue += Number(item.subtotal)
      productMap.set(item.productId, existing)
    }
  }

  return Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.productName,
      quantitySold: data.quantitySold,
      revenue: data.revenue.toFixed(2),
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit)
}

// --- Special Orders ---

export async function getSpecialOrders(status?: SpecialOrderStatus): Promise<SpecialOrder[]> {
  await delay()
  if (status) {
    return specialOrders.filter((o) => o.status === status)
  }
  return [...specialOrders]
}

export async function getSpecialOrder(id: string): Promise<SpecialOrder> {
  await delay()
  const order = specialOrders.find((o) => o.id === id)
  if (!order) throw new Error("Pedido especial no encontrado")
  return { ...order }
}

export async function createSpecialOrder(
  data: CreateSpecialOrderRequest,
  sellerName: string,
  actor: Actor
): Promise<SpecialOrder> {
  await delay()

  const orderItems = data.items.map((item) => {
    const subtotal = (item.unitPrice * item.quantity).toFixed(2)
    return {
      id: nextId(),
      productId: item.productId || null,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      subtotal,
    }
  })

  const itemsTotal = orderItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const shippingCostNum = data.shippingCost ?? 0
  const total = (itemsTotal + shippingCostNum).toFixed(2)

  // PICKUP orders reserve stock immediately
  if (data.deliveryMethod === "PICKUP") {
    for (const item of data.items) {
      if (item.productId) {
        const productIndex = products.findIndex((p) => p.id === item.productId)
        if (productIndex !== -1) {
          products[productIndex].stock -= item.quantity
        }
      }
    }
  }

  const order: SpecialOrder = {
    id: nextId(),
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    items: orderItems,
    total,
    deliveryMethod: data.deliveryMethod,
    shippingAddress: data.shippingAddress,
    shippingCost: data.shippingCost !== undefined ? data.shippingCost.toFixed(2) : undefined,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PAID",
    status: "PENDING",
    notes: data.notes,
    createdAt: now(),
    updatedAt: now(),
    sellerName,
  }

  specialOrders = [order, ...specialOrders]
  logAction({ userId: actor.userId, userName: actor.userName, action: "special-order.create", targetId: order.id, targetName: order.customerName })
  return { ...order }
}

export async function updateSpecialOrderStatus(
  id: string,
  status: SpecialOrderStatus,
  actor: Actor
): Promise<SpecialOrder> {
  await delay()
  const index = specialOrders.findIndex((o) => o.id === id)
  if (index === -1) throw new Error("Pedido especial no encontrado")

  const order = specialOrders[index]

  // SHIPPING orders: affect stock when marked as DELIVERED
  if (
    status === "DELIVERED" &&
    order.deliveryMethod === "SHIPPING" &&
    order.status !== "DELIVERED"
  ) {
    for (const item of order.items) {
      if (item.productId) {
        const productIndex = products.findIndex((p) => p.id === item.productId)
        if (productIndex !== -1) {
          products[productIndex].stock -= item.quantity
        }
      }
    }
  }

  specialOrders[index] = { ...order, status, updatedAt: now() }
  logAction({ userId: actor.userId, userName: actor.userName, action: "special-order.status", targetId: id, targetName: order.customerName })
  return { ...specialOrders[index] }
}

export async function markSpecialOrderPaid(id: string, actor: Actor): Promise<SpecialOrder> {
  await delay()
  const index = specialOrders.findIndex((o) => o.id === id)
  if (index === -1) throw new Error("Pedido especial no encontrado")
  specialOrders[index] = { ...specialOrders[index], paymentStatus: "PAID", updatedAt: now() }
  logAction({ userId: actor.userId, userName: actor.userName, action: "special-order.paid", targetId: id, targetName: specialOrders[index].customerName })
  return { ...specialOrders[index] }
}

// --- Events ---

export async function getEvents(): Promise<BandEvent[]> {
  await delay()
  return [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getActiveEvent(): Promise<BandEvent | null> {
  await delay()
  return events.find((e) => e.status === "ACTIVE") ?? null
}

export async function createEvent(data: CreateEventRequest, actor: Actor): Promise<BandEvent> {
  await delay()
  const event: BandEvent = {
    id: nextId(),
    name: data.name,
    type: data.type,
    date: data.date,
    location: data.location,
    notes: data.notes,
    status: "INACTIVE",
    createdAt: now(),
  }
  events = [event, ...events]
  logAction({ userId: actor.userId, userName: actor.userName, action: "event.create", targetId: event.id, targetName: event.name })
  return { ...event }
}

export async function setEventStatus(id: string, status: EventStatus, actor: Actor): Promise<BandEvent> {
  await delay()
  // Only one active event at a time
  if (status === "ACTIVE") {
    events = events.map((e) => ({ ...e, status: e.id === id ? "ACTIVE" : "INACTIVE" }))
  } else {
    const index = events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Evento no encontrado")
    events[index] = { ...events[index], status }
  }
  const event = events.find((e) => e.id === id)!
  logAction({ userId: actor.userId, userName: actor.userName, action: "event.status", targetId: id, targetName: event.name })
  return { ...event }
}

export async function deleteEvent(id: string, actor: Actor): Promise<void> {
  await delay()
  const event = events.find((e) => e.id === id)
  events = events.filter((e) => e.id !== id)
  logAction({ userId: actor.userId, userName: actor.userName, action: "event.delete", targetId: id, targetName: event?.name })
}

// --- Today's sales ---

export async function getTodaySales(): Promise<{ total: string; count: number; eventName?: string }> {
  await delay()
  const today = new Date().toISOString().split("T")[0]
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today))
  const total = todaySales.reduce((sum, s) => sum + Number(s.total), 0)
  const activeEvent = events.find((e) => e.status === "ACTIVE")
  return {
    total: total.toFixed(2),
    count: todaySales.length,
    eventName: activeEvent?.name,
  }
}

export async function getStockValue(): Promise<{
  totalItems: number
  totalCostValue: string
  totalSaleValue: string
  products: {
    productId: string
    productName: string
    stock: number
    costValue: string
    saleValue: string
  }[]
}> {
  await delay()
  const productList = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    stock: p.stock,
    costValue: (p.stock * Number(p.purchasePrice)).toFixed(2),
    saleValue: (p.stock * Number(p.salePrice)).toFixed(2),
  }))

  return {
    totalItems: products.reduce((sum, p) => sum + p.stock, 0),
    totalCostValue: productList.reduce((sum, p) => sum + Number(p.costValue), 0).toFixed(2),
    totalSaleValue: productList.reduce((sum, p) => sum + Number(p.saleValue), 0).toFixed(2),
    products: productList,
  }
}
