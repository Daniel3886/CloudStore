"use client"

import { useTranslations } from "next-intl"
import { Check, Clock, X, type LucideIcon } from "lucide-react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import type { ShareStatus } from "@/features/sharing/api"

export const shareStatusStyles: Record<ShareStatus, { variant: BadgeProps["variant"]; icon: LucideIcon }> = {
  PENDING: { variant: "secondary", icon: Clock },
  ACCEPTED: { variant: "default", icon: Check },
  DECLINED: { variant: "destructive", icon: X },
}

export function ShareStatusBadge({ status }: { status: ShareStatus }) {
  const t = useTranslations("sharing.status")
  const { variant, icon: Icon } = shareStatusStyles[status] ?? shareStatusStyles.PENDING

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {t(status)}
    </Badge>
  )
}
