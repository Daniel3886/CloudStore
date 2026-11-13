"use client"

import { useTranslations } from "next-intl"
import { X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function OwnerRow() {
  const t = useTranslations("sharing.management")

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{t("ownerInitials")}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{t("ownerName")}</p>
          <p className="text-xs text-muted-foreground">{t("ownerDescription")}</p>
        </div>
      </div>
      <Badge variant="default">{t("ownerBadge")}</Badge>
    </div>
  )
}

interface SharedUserRowProps {
  email: string
  onRevoke: (email: string) => void
}

export function SharedUserRow({ email, onRevoke }: SharedUserRowProps) {
  const t = useTranslations("sharing.management")

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{email}</p>
          <p className="text-xs text-muted-foreground">{t("userDescription")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{t("sharedBadge")}</Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRevoke(email)}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          aria-label={t("revokeAccess", { email })}
          title={t("revokeAccess", { email })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
