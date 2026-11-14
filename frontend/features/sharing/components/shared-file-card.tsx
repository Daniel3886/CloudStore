"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Calendar, Check, Download, FileIcon, Loader2, MessageSquare, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { SharedFileDto } from "@/features/sharing/api"
import { ShareStatusBadge, shareStatusStyles } from "@/features/sharing/components/share-status-badge"
import type { SharedFileAction } from "@/features/sharing/hooks/use-shared-files"
import { parseDate } from "@/features/sharing/lib/share"

interface SharedFileCardProps {
  file: SharedFileDto
  pendingAction?: SharedFileAction
  onAccept: (file: SharedFileDto) => void
  onDecline: (file: SharedFileDto) => void
  onDownload: (file: SharedFileDto) => void
}

export function SharedFileCard({ file, pendingAction, onAccept, onDecline, onDownload }: SharedFileCardProps) {
  const t = useTranslations("sharing.browser")
  const format = useFormatter()
  const busy = pendingAction !== undefined
  const sharedAt = parseDate(file.sharedAt)
  const changedAt = file.shareStatus !== "PENDING" ? parseDate(file.shareStatusChangedAt) : null
  const StatusIcon = (shareStatusStyles[file.shareStatus] ?? shareStatusStyles.PENDING).icon
  const formatDate = (date: Date) => format.dateTime(date, { dateStyle: "medium" })
  const spinner = <Loader2 className="h-4 w-4 animate-spin" />

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{file.displayName}</CardTitle>
              <div className="flex items-center mt-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t("sharedBy", { name: file.sharedBy })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <ShareStatusBadge status={file.shareStatus} />

            {file.shareStatus === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAccept(file)}
                  disabled={busy}
                  className="text-green-600 hover:text-green-700"
                  aria-label={t("accept", { name: file.displayName })}
                >
                  {pendingAction === "accept" ? spinner : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDecline(file)}
                  disabled={busy}
                  className="text-red-600 hover:text-red-700"
                  aria-label={t("decline", { name: file.displayName })}
                >
                  {pendingAction === "decline" ? spinner : <X className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {file.shareStatus === "ACCEPTED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file)}
                disabled={busy}
                aria-label={t("download", { name: file.displayName })}
              >
                {pendingAction === "download" ? spinner : <Download className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div>
          {sharedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t("sharedAt", { date: formatDate(sharedAt) })}</span>
            </div>
          )}

          {changedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StatusIcon className="h-4 w-4" />
              <span>{t("statusChangedAt", { status: file.shareStatus, date: formatDate(changedAt) })}</span>
            </div>
          )}

          {file.message && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  <span>{t("message")}</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{file.message}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
