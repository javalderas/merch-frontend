export type Role = "admin" | "seller"

export interface User {
  id: string
  name: string
  role: Role
  avatarUrl?: string
}
