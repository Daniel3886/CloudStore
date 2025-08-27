import type React from "react"
import { DashboardNav, MobileNavTrigger } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 flex h-16 items-center gap-1 border-b bg-background px-5">
            <div className="flex items-center gap-2 font-semibold">
              <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">CS</div>
              <span>CloudStore</span>
            </div>
            
            <div className="md:hidden">
              <MobileNavTrigger />
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              <ModeToggle />
              <UserNav />
            </div>
          </header>
          <div className="flex flex-1 m-1">
            <DashboardNav />
            <main className="flex-1 p-6">{children}</main>
          </div>
          <Toaster />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
