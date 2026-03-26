import * as store from "./mock-store"
import type { ReportSummary, TopProduct, StockValuation } from "@/types/report"

export async function getReportSummary(dateFrom?: string, dateTo?: string): Promise<ReportSummary> {
  return store.getReportSummary(dateFrom, dateTo)
}

export async function getTopProducts(
  dateFrom?: string,
  dateTo?: string,
  limit?: number
): Promise<TopProduct[]> {
  return store.getTopProducts(dateFrom, dateTo, limit)
}

export async function getStockValue(): Promise<StockValuation> {
  return store.getStockValue()
}
