import type { AuditEntry } from "@/types/audit"

const auditLog: AuditEntry[] = []
let auditCounter = 0

export function logAction(params: Omit<AuditEntry, "id" | "createdAt">): void {
  auditLog.push({
    ...params,
    id: `audit-${++auditCounter}`,
    createdAt: new Date().toISOString(),
  })
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  return [...auditLog].reverse()
}
