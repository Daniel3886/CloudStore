"use client"

import { useTranslations } from "next-intl"
import { FileIcon, RefreshCw } from "lucide-react"
import type { FileView } from "@/features/files/types"

export function FileBrowserLoading() {
  const t = useTranslations("files.browser")
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    </div>
  )
}

export function FileBrowserEmptyState({ view }: { view: FileView }) {
  const t = useTranslations("files.browser.empty")
  const isTrash = view === "trash"

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileIcon className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
      <h3 className="text-lg font-medium mb-2">{isTrash ? t("trashTitle") : t("title")}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isTrash ? t("trashDescription") : view === "recent" ? t("recentDescription") : t("allDescription")}
      </p>
    </div>
  )
}
