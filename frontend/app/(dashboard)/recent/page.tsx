"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { FileBrowser } from "@/features/files/components/file-browser"
import { FileHeader } from "@/features/files/components/file-header"

export default function RecentPage() {
  const t = useTranslations("files.pages")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <FileHeader title={t("recent")} type="recent" onSearch={setSearchQuery} />
      <FileBrowser type="recent" searchQuery={searchQuery} />
    </div>
  )
}
