import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { AuthProvider } from "@/contexts/auth-context"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
