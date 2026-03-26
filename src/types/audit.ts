export interface AuditEntry {
  id: string
  userId: string
  userName: string
  action: string      // e.g. "product.update", "sale.create", "stock.adjust"
  targetId?: string
  targetName?: string
  createdAt: string
}
