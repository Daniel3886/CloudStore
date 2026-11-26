"use client"

import { useTranslations } from "next-intl"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PublicFileAccessToken } from "@/features/public-links/api"
import { FileActionsMenu } from "@/features/files/components/file-actions-menu"
import { FileIconComponent } from "@/features/files/components/file-icons"
import { PublicLinkBadge, TrashCountdown } from "@/features/files/components/file-status"
import { useFileFormatters } from "@/features/files/hooks/use-file-formatters"
import type { FileSort, SortKey } from "@/features/files/lib/sort-files"
import { getItemPath } from "@/features/files/lib/file-filters"
import type { FileAction, FileItem } from "@/features/files/types"

interface FileListProps {
  files: FileItem[]
  sort: FileSort
  onSortChange: (key: SortKey) => void
  loadingStates: Record<number, boolean>
  isTrashView: boolean
  folderCounts: Map<string, number>
  publicLinks: Map<number, PublicFileAccessToken>
  onFileClick: (file: FileItem) => void
  onFileAction: (action: FileAction, file: FileItem) => void
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSortChange,
  className,
}: {
  label: string
  sortKey: SortKey
  sort: FileSort
  onSortChange: (key: SortKey) => void
  className?: string
}) {
  const active = sort.key === sortKey
  const Arrow = sort.direction === "asc" ? ArrowUp : ArrowDown
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-3 py-2 text-left font-medium", className)}
    >
      <button
        type="button"
        onClick={() => onSortChange(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "text-foreground",
        )}
      >
        {label}
        <Arrow className={cn("h-3.5 w-3.5", !active && "invisible")} aria-hidden />
      </button>
    </th>
  )
}

export function FileList({
  files,
  sort,
  onSortChange,
  loadingStates,
  isTrashView,
  folderCounts,
  publicLinks,
  onFileClick,
  onFileAction,
}: FileListProps) {
  const t = useTranslations("files.list")
  const tBrowser = useTranslations("files.browser")
  const { formatSize, formatRelativeDate } = useFileFormatters()
  const header = { sort, onSortChange }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">{t("caption")}</caption>
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <SortHeader label={t("name")} sortKey="name" {...header} className="pl-4" />
            <SortHeader label={t("size")} sortKey="size" {...header} className="hidden sm:table-cell" />
            {isTrashView ? (
              <SortHeader label={t("deletedForGood")} sortKey="purgeAt" {...header} />
            ) : (
              <>
                <SortHeader label={t("modified")} sortKey="modified" {...header} className="hidden md:table-cell" />
                <th scope="col" className="px-3 py-2 text-left font-medium hidden sm:table-cell">
                  {t("publicLink")}
                </th>
              </>
            )}
            <th scope="col" className="w-12 px-2 py-2">
              <span className="sr-only">{t("actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const canOpen = file.isFolder && !isTrashView
            const count = file.isFolder ? (folderCounts.get(getItemPath(file)) ?? 0) : 0
            return (
              <tr
                key={file.id}
                className={cn("border-b last:border-0 hover:bg-muted/40", canOpen && "cursor-pointer")}
                onClick={canOpen ? () => onFileClick(file) : undefined}
              >
                <td className="py-2 pl-4 pr-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIconComponent fileType={file.type} className="h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      {canOpen ? (
                        <button
                          type="button"
                          className="block max-w-full truncate text-left font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onFileClick(file)
                          }}
                          title={file.name}
                        >
                          {file.name}
                        </button>
                      ) : (
                        <span className="block truncate font-medium" title={file.name}>
                          {file.name}
                        </span>
                      )}
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:hidden">
                        <span>
                          {file.isFolder ? tBrowser("itemCount", { count }) : formatSize(file.size ?? 0)}
                          {!isTrashView && !file.isFolder && file.modified
                            ? ` · ${formatRelativeDate(file.modified)}`
                            : null}
                        </span>
                        {!isTrashView && !file.isFolder && publicLinks.has(file.id) && (
                          <PublicLinkBadge link={publicLinks.get(file.id)} />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground sm:table-cell">
                  {file.isFolder ? tBrowser("itemCount", { count }) : formatSize(file.size ?? 0)}
                </td>
                {isTrashView ? (
                  <td className="whitespace-nowrap px-3 py-2">
                    <TrashCountdown purgeAt={file.purgeAt} />
                  </td>
                ) : (
                  <>
                    <td className="hidden whitespace-nowrap px-3 py-2 text-muted-foreground md:table-cell">
                      {file.modified ? formatRelativeDate(file.modified) : "—"}
                    </td>
                    <td className="hidden px-3 py-2 sm:table-cell">
                      {file.isFolder ? null : <PublicLinkBadge link={publicLinks.get(file.id)} />}
                    </td>
                  </>
                )}
                <td className="px-2 py-1 text-right">
                  <FileActionsMenu
                    file={file}
                    isLoading={loadingStates[file.id] ?? false}
                    isTrashView={isTrashView}
                    onFileAction={onFileAction}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
