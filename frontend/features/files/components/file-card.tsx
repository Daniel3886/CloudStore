"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import type { PublicFileAccessToken } from "@/features/public-links/api"
import { FileActionsMenu } from "@/features/files/components/file-actions-menu"
import { FileIconComponent } from "@/features/files/components/file-icons"
import { PublicLinkBadge, TrashCountdown } from "@/features/files/components/file-status"
import { useFileFormatters } from "@/features/files/hooks/use-file-formatters"
import { cn } from "@/lib/utils"
import type { FileAction, FileItem } from "@/features/files/types"

interface FileCardProps {
  file: FileItem
  isLoading: boolean
  isTrashView?: boolean
  folderCount?: number
  publicLink?: PublicFileAccessToken
  onFileClick: (file: FileItem) => void
  onFileAction: (action: FileAction, file: FileItem) => void
}

export function FileCard({
  file,
  isLoading,
  isTrashView = false,
  folderCount = 0,
  publicLink,
  onFileClick,
  onFileAction,
}: FileCardProps) {
  const t = useTranslations("files.browser")
  const { formatSize, formatRelativeDate } = useFileFormatters()
  const canOpen = file.isFolder && !isTrashView

  return (
    <Card
      className={cn(
        "relative overflow-hidden hover:bg-muted/30 transition-colors duration-200 focus-within:ring-2 focus-within:ring-ring",
        canOpen && "cursor-pointer",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="pointer-events-none">
            <FileIconComponent fileType={file.type} />
          </div>
          <FileActionsMenu
            file={file}
            isLoading={isLoading}
            isTrashView={isTrashView}
            onFileAction={onFileAction}
            className="-mr-2 -mt-2"
          />
        </div>
        <div className="mt-4">
          <h3 className="font-sans font-medium tracking-normal truncate" title={file.name}>
            {canOpen ? (
              <button
                type="button"
                className="max-w-full truncate text-left outline-none after:absolute after:inset-0"
                onClick={() => onFileClick(file)}
              >
                {file.name}
              </button>
            ) : (
              file.name
            )}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {file.isFolder ? (
              <span>{t("itemCount", { count: folderCount })}</span>
            ) : (
              <span>
                {formatSize(file.size ?? 0)}
                {!isTrashView && file.modified ? ` · ${formatRelativeDate(file.modified)}` : null}
              </span>
            )}
            {isTrashView && <TrashCountdown purgeAt={file.purgeAt} />}
            {!isTrashView && publicLink && <PublicLinkBadge link={publicLink} />}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
