"use client"

import type React from "react"
import { useTranslations } from "next-intl"
import { Calendar, HardDrive, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFileFormatters } from "@/features/files/hooks/use-file-formatters"
import type { FileItem } from "@/features/files/types"

function DetailRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span>{children}</span>
    </div>
  )
}

export function FileDetailsInfo({ file }: { file: FileItem }) {
  const t = useTranslations("files.details")
  const { formatSize, formatRelativeDate } = useFileFormatters()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{file.displayName || file.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {typeof file.size === "number" && <DetailRow icon={HardDrive}>{formatSize(file.size)}</DetailRow>}
        {file.modified != null && (
          <DetailRow icon={Calendar}>{t("uploaded", { date: formatRelativeDate(file.modified) })}</DetailRow>
        )}
        <DetailRow icon={User}>{file.owner ? t("ownedBy", { owner: file.owner }) : t("ownedByYou")}</DetailRow>
      </CardContent>
    </Card>
  )
}
