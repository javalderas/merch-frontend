"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { BAND_CONFIG } from "@/lib/config/band-config"
import { cn } from "@/lib/utils"

function roleBadgeClass(role: string) {
  return role === "admin"
    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
    : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
}

function roleLabel(role: string) {
  return role === "admin" ? "Admin" : "Vendedor"
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, users, switchUser } = useAuth()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-background">
      {/* Mobile: band name */}
      <div className="md:hidden">
        <span className="text-lg font-bold text-primary">{BAND_CONFIG.name}</span>
      </div>

      {/* Mobile: user switcher — shown on the left side of the right cluster */}
      <div className="flex items-center gap-2 md:hidden" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 h-8 px-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Cambiar usuario"
          >
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground hidden xs:inline">{user.name}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-popover shadow-md z-50 py-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { switchUser(u.id); setOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors",
                    u.id === user.id && "bg-accent"
                  )}
                >
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold">{u.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{u.name}</p>
                    <span className={cn("text-[10px] px-1 py-0.5 rounded-full font-medium", roleBadgeClass(u.role))}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 hidden dark:block" />
          <Moon className="h-4 w-4 dark:hidden" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>

      {/* Desktop: empty left, theme toggle right */}
      <div className="hidden md:block" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-9 w-9 hidden md:flex"
      >
        <Sun className="h-4 w-4 hidden dark:block" />
        <Moon className="h-4 w-4 dark:hidden" />
        <span className="sr-only">Cambiar tema</span>
      </Button>
    </header>
  )
}
