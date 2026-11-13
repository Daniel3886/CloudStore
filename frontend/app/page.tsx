"use client"

import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/components/auth-provider"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations("common")

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/files")
      } else {
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <div className="size-16 rounded-md bg-primary text-primary-foreground grid place-items-center text-2xl font-bold mx-auto">
          CS
        </div>
        <h1 className="text-2xl font-bold">{t("appName")}</h1>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    </div>
  )
}
