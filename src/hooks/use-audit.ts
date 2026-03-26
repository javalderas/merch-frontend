"use client"

import { useQuery } from "@tanstack/react-query"
import { getAuditLog } from "@/lib/api/audit-api"

export function useAuditLog() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: getAuditLog,
    refetchInterval: 5000,
  })
}
