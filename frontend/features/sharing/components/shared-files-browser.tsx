"use client"

import { useTranslations } from "next-intl"
import { FileIcon, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SharedFileCard } from "@/features/sharing/components/shared-file-card"
import { useSharedFiles } from "@/features/sharing/hooks/use-shared-files"

export function SharedFilesBrowser() {
  const t = useTranslations("sharing.browser")
  const { files, isLoading, pending, accept, decline, download } = useSharedFiles()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{t("emptyTitle")}</h3>
        <p className="text-muted-foreground">{t("emptyDescription")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <Badge variant="secondary">{t("count", { count: files.length })}</Badge>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <SharedFileCard
            key={file.permissionId}
            file={file}
            pendingAction={pending[file.permissionId]}
            onAccept={accept}
            onDecline={decline}
            onDownload={download}
          />
        ))}
      </div>
    </div>
  )
}
