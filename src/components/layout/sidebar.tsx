"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  BarChart3,
  Music2,
  ClipboardList,
  Activity,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { BAND_CONFIG } from "@/lib/config/band-config"

const navItems = [
  { label: "Inicio", href: "/", icon: LayoutDashboard },
  { label: "Venta", href: "/pos", icon: ShoppingCart },
  { label: "Productos", href: "/products", icon: Package },
  { label: "Ventas", href: "/sales", icon: Receipt },
  { label: "Pedidos", href: "/special-orders", icon: ClipboardList },
  { label: "Eventos", href: "/events", icon: CalendarDays },
  { label: "Gastos", href: "/expenses", icon: Wallet },
  { label: "Informes", href: "/reports", icon: BarChart3 },
]

function roleBadgeClass(role: string) {
  return role === "admin"
    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
    : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
}

function roleLabel(role: string) {
  return role === "admin" ? "Admin" : "Vendedor"
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, users, switchUser, can } = useAuth()

  function cycleUser() {
    const currentIndex = users.findIndex((u) => u.id === user.id)
    const nextIndex = (currentIndex + 1) % users.length
    switchUser(users[nextIndex].id)
  }

  return (
    <aside className="hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Band identity block */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 mb-3">
          {BAND_CONFIG.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={BAND_CONFIG.logoUrl}
              alt={BAND_CONFIG.name}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <Music2 className="h-5 w-5 text-sidebar-primary" />
            </div>
          )}
          <span className="text-base font-bold text-sidebar-primary leading-tight">
            {BAND_CONFIG.name}
          </span>
        </Link>

        {/* Current user indicator */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-sidebar-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate leading-none mb-0.5">
                {user.name}
              </p>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", roleBadgeClass(user.role))}>
                {roleLabel(user.role)}
              </span>
            </div>
          </div>
          <button
            onClick={cycleUser}
            className="text-[10px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors flex-shrink-0 underline underline-offset-2"
          >
            cambiar
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        {can("audit:view") && (
          <Link
            href="/audit"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === "/audit" || pathname.startsWith("/audit")
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Activity className="h-5 w-5" />
            Actividad
          </Link>
        )}
      </nav>
    </aside>
  )
}
