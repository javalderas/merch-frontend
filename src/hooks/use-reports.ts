"use client"

import { useQuery } from "@tanstack/react-query"
import { getReportSummary, getTopProducts, getStockValue } from "@/lib/api/report-api"

export function useReportSummary(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["reports", "summary", dateFrom, dateTo],
    queryFn: () => getReportSummary(dateFrom, dateTo),
  })
}

export function useTopProducts(dateFrom?: string, dateTo?: string, limit?: number) {
  return useQuery({
    queryKey: ["reports", "top-products", dateFrom, dateTo, limit],
    queryFn: () => getTopProducts(dateFrom, dateTo, limit),
  })
}

export function useStockValue() {
  return useQuery({
    queryKey: ["reports", "stock-value"],
    queryFn: () => getStockValue(),
  })
}
