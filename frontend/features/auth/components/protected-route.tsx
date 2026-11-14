"use client"

import { useTranslations } from "next-intl"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/components/auth-provider"

interface ProtectedRouteProps {
  children: React.ReactNode
}

function AppSplash({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="size-16 rounded-md bg-primary text-primary-foreground grid place-items-center text-2xl font-bold mx-auto">
          CS
        </div>
        {children}
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, profileUnavailable, loadUserProfile, logout } = useAuth()
  const router = useRouter()
  const t = useTranslations("common")
  const [retrying, setRetrying] = useState(false)

  const mustSignIn = !isLoading && !isAuthenticated && !profileUnavailable

  useEffect(() => {
    if (mustSignIn) {
      router.push("/login")
    }
  }, [mustSignIn, router])

  const retry = async () => {
    setRetrying(true)
    await loadUserProfile()
    setRetrying(false)
  }

  if (isLoading) {
    return (
      <AppSplash>
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">{t("loadingApp")}</p>
      </AppSplash>
    )
  }

  if (!isAuthenticated && profileUnavailable) {
    return (
      <AppSplash>
        <WifiOff className="h-8 w-8 mx-auto text-muted-foreground" aria-hidden="true" />
        <h1 className="text-lg font-semibold">{t("sessionUnavailable.title")}</h1>
        <p className="text-muted-foreground">{t("sessionUnavailable.description")}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={retry} disabled={retrying}>
            {retrying && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("retry")}
          </Button>
          <Button variant="outline" onClick={logout}>
            {t("userMenu.logout")}
          </Button>
        </div>
      </AppSplash>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
