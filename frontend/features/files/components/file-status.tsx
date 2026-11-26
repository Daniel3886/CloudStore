"use client"

import { useTranslations } from "next-intl"
import { Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getExpiryInfo } from "@/features/public-links/lib/links"
import type { PublicFileAccessToken } from "@/features/public-links/api"
import { TRASH_WARNING_DAYS, daysUntilPurge } from "@/features/files/lib/trash"

/** Amber badge for a file that anyone with the link can open, with the time left. */
export function PublicLinkBadge({ link }: { link: PublicFileAccessToken | undefined }) {
  const t = useTranslations("files.status")
  if (!link) {
    return (
      <span className="text-muted-foreground">
        <span aria-hidden>—</span>
        <span className="sr-only">{t("noPublicLink")}</span>
      </span>
    )
  }
  const { hours, minutes } = getExpiryInfo(link.expiresAt)
  const left = hours > 0 ? t("hoursLeft", { hours }) : t("minutesLeft", { minutes })

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning"
      title={t("publicLinkTitle")}
    >
      <Link2 className="h-3 w-3" aria-hidden />
      <span className="sr-only">{t("publicLinkLabel")}</span>
      {left}
    </span>
  )
}

/** How long until the nightly cleanup deletes a trashed file for good. */
export function TrashCountdown({ purgeAt, className }: { purgeAt: number | undefined; className?: string }) {
  const t = useTranslations("files.status")
  const days = daysUntilPurge(purgeAt)
  if (days === undefined) return <span className={cn("text-muted-foreground", className)}>—</span>

  return (
    <span className={cn(days <= TRASH_WARNING_DAYS ? "text-warning font-medium" : "text-muted-foreground", className)}>
      {t("purgeIn", { days })}
    </span>
  )
}
