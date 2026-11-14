"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2, Settings } from "lucide-react"
import { useAuth } from "@/features/auth/components/auth-provider"
import { ProfileCard } from "@/features/settings/components/profile-card"
import { ChangePasswordCard } from "@/features/settings/components/change-password-card"
import { DeleteAccountCard } from "@/features/settings/components/delete-account-card"
import { LanguageCard } from "@/features/settings/components/language-card"

export function SettingsPage() {
  const t = useTranslations("settings")
  const { user, loadUserProfile, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadUserProfile().finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadUserProfile])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <ProfileCard email={user?.email} username={user?.username} />
      <LanguageCard />
      <ChangePasswordCard email={user?.email} />
      <DeleteAccountCard email={user?.email} onDeleted={logout} />
    </div>
  )
}
