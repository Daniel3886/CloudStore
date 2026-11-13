"use client"

import { useTranslations } from "next-intl"
import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileCardProps {
  email?: string
  username?: string
}

export function ProfileCard({ email, username }: ProfileCardProps) {
  const t = useTranslations("settings.profile")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="profile-email">{t("email")}</Label>
        <Input id="profile-email" value={email ?? ""} disabled className="bg-muted" />
        <Label htmlFor="profile-username">{t("username")}</Label>
        <Input id="profile-username" value={username ?? ""} disabled className="bg-muted" />
      </CardContent>
    </Card>
  )
}
