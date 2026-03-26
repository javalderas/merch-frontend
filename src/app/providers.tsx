"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { CartProvider } from "@/contexts/cart-context"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {children}
          <Toaster richColors position="top-center" />
          <ReactQueryDevtools initialIsOpen={false} />
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
