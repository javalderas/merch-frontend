"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"

const navItems = [
  { label: "Inicio", href: "/", icon: LayoutDashboard },
  { label: "Venta", href: "/pos", icon: ShoppingCart, showBadge: true },
  { label: "Productos", href: "/products", icon: Package },
  { label: "Ventas", href: "/sales", icon: Receipt },
  { label: "Pedidos", href: "/special-orders", icon: ClipboardList },
]

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
