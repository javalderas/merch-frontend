export interface ReportSummary {
  totalRevenue: string
  totalExpenses: string
  profit: string
  salesCount: number
  specialOrdersRevenue: string
  pendingSpecialOrdersIncome: string
  period: {
    from: string
    to: string
  }
}

export interface TopProduct {
  productId: string
  productName: string
  quantitySold: number
  revenue: string
}

export interface StockValuation {
  totalItems: number
  totalCostValue: string
  totalSaleValue: string
  products: StockValuationProduct[]
}

export interface StockValuationProduct {
  productId: string
  productName: string
  stock: number
  costValue: string
  saleValue: string
}
