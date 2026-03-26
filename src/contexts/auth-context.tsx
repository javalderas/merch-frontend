"use client"

import { createContext, useContext, useState } from "react"
import type { User, Role } from "@/types/user"
import { MOCK_USERS } from "@/lib/api/mock-users"

const PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "products:edit",
    "products:delete",
    "expenses:manage",
    "sales:create",
    "sales:view_seller",
    "orders:manage",
    "reports:view",
    "audit:view",
    "users:manage",
  ],
  seller: [
    "sales:create",
    "orders:manage",
    "reports:view",
  ],
}

interface AuthContextType {
  user: User
  can: (permission: string) => boolean
  switchUser: (userId: string) => void
  users: User[]
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USERS[0]) // default: admin

  function can(permission: string): boolean {
    return PERMISSIONS[user.role]?.includes(permission) ?? false
  }

  function switchUser(userId: string) {
    const found = MOCK_USERS.find((u) => u.id === userId)
    if (found) setUser(found)
  }

  return (
    <AuthContext.Provider value={{ user, can, switchUser, users: MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
