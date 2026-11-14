"use client"

import { useTranslations } from "next-intl"
import { Clock, Download, Eye, FileIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { publicLinksApi, type PublicFileAccessToken } from "@/features/public-links/api"
import { CopyLinkButton } from "@/features/public-links/components/copy-link-button"
import { useFormatFileSize } from "@/hooks/use-format-file-size"
import { canPreview, getExpiryInfo, openInNewTab } from "@/features/public-links/lib/links"

interface PublicLinkRowProps {
  link: PublicFileAccessToken
  onRevoke: (link: PublicFileAccessToken) => void
}

export function PublicLinkRow({ link, onRevoke }: PublicLinkRowProps) {
  const t = useTranslations("publicLinks")
  const formatFileSize = useFormatFileSize()
  const expiry = getExpiryInfo(link.expiresAt)
  const previewUrl = publicLinksApi.getPublicFileUrl(link.token, true)
  const downloadUrl = publicLinksApi.getPublicFileUrl(link.token)

  const expiryText = expiry.expired
    ? t("expiry.expired")
    : expiry.hours > 0
      ? t("expiry.hoursRemaining", { hours: expiry.hours, minutes: expiry.minutes })
      : t("expiry.minutesRemaining", { minutes: expiry.minutes })

  return (
    <Card className={expiry.expired ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{link.file.displayName}</h4>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{formatFileSize(link.file.size)}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className={cn(expiry.expired && "text-red-600")}>{expiryText}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {!expiry.expired && canPreview(link.file.size) && (
              <>
                <CopyLinkButton link={previewUrl} kind="preview" icon={<Eye className="h-4 w-4" />} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInNewTab(previewUrl)}
                  title={t("actions.openPreview")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t("actions.preview")}
                </Button>
              </>
            )}

            {!expiry.expired && (
              <>
                <CopyLinkButton link={downloadUrl} kind="download" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInNewTab(downloadUrl)}
                  title={t("actions.openDownload")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t("actions.download")}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(link)}
              className="text-red-600 hover:text-red-700"
              title={t("actions.revoke")}
              aria-label={t("actions.revoke")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
