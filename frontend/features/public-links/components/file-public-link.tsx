"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Clock, Eye, Globe, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { publicLinksApi, type PublicFileAccessToken } from "@/features/public-links/api"
import { CopyLinkButton } from "@/features/public-links/components/copy-link-button"
import { RevokeLinkDialog } from "@/features/public-links/components/revoke-link-dialog"
import { useGeneratePublicLink } from "@/features/public-links/hooks/use-generate-public-link"
import { indexActiveLinks } from "@/features/public-links/hooks/use-public-link-status"
import { usePublicLinks } from "@/features/public-links/hooks/use-public-links"
import { canPreview, getExpiryInfo } from "@/features/public-links/lib/links"

const LINK_LIFETIME_HOURS = 24

interface FilePublicLinkProps {
  fileId: number | null
  fileSize?: number
  enabled: boolean
}

/** Create, copy and revoke the public link for one file, with the time it has left. */
export function FilePublicLink({ fileId, fileSize, enabled }: FilePublicLinkProps) {
  const t = useTranslations("publicLinks.fileLink")
  const tExpiry = useTranslations("publicLinks.expiry")
  const { links, isLoading, refresh, revoke } = usePublicLinks(enabled && fileId != null)
  const { isGenerating, generate } = useGeneratePublicLink(fileId ?? 0)
  const [linkToRevoke, setLinkToRevoke] = useState<PublicFileAccessToken | null>(null)

  const link = useMemo(() => (fileId == null ? undefined : indexActiveLinks(links).get(fileId)), [links, fileId])

  const handleGenerate = async () => {
    await generate()
    await refresh()
  }

  if (fileId == null) return <p className="text-sm text-muted-foreground">{t("unavailable")}</p>

  if (isLoading && !link) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {t("loading")}
      </div>
    )
  }

  if (!link) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("description", { hours: LINK_LIFETIME_HOURS })}</p>
        <Button variant="outline" className="w-full" onClick={() => void handleGenerate()} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
          ) : (
            <Globe className="h-4 w-4 mr-2" aria-hidden />
          )}
          {isGenerating ? t("creating") : t("create", { hours: LINK_LIFETIME_HOURS })}
        </Button>
      </div>
    )
  }

  const expiry = getExpiryInfo(link.expiresAt)
  const left =
    expiry.hours > 0
      ? tExpiry("hoursRemaining", { hours: expiry.hours, minutes: expiry.minutes })
      : tExpiry("minutesRemaining", { minutes: expiry.minutes })
  const usedPercent = Math.min(
    100,
    Math.max(0, 100 - ((expiry.hours * 60 + expiry.minutes) / (LINK_LIFETIME_HOURS * 60)) * 100),
  )
  const size = fileSize ?? link.file.size

  return (
    <div className="space-y-3 rounded-md border border-warning/40 bg-warning-soft/40 p-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{t("active")}</span>
        <span className="flex items-center gap-1 font-medium text-warning">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {left}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={t("timeUsed")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(usedPercent)}
      >
        <div className="h-full bg-warning" style={{ width: `${100 - usedPercent}%` }} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyLinkButton link={publicLinksApi.getPublicFileUrl(link.token)} kind="download" />
        {canPreview(size) && (
          <CopyLinkButton
            link={publicLinksApi.getPublicFileUrl(link.token, true)}
            kind="preview"
            icon={<Eye className="h-4 w-4" />}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto text-destructive hover:text-destructive"
          onClick={() => setLinkToRevoke(link)}
        >
          <Trash2 className="h-4 w-4 mr-1" aria-hidden />
          {t("revoke")}
        </Button>
      </div>

      <RevokeLinkDialog
        link={linkToRevoke}
        onCancel={() => setLinkToRevoke(null)}
        onConfirm={(target) => {
          setLinkToRevoke(null)
          void revoke(target)
        }}
      />
    </div>
  )
}
