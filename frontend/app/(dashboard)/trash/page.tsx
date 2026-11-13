"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { FileBrowser } from "@/features/files/components/file-browser"
import { FileHeader } from "@/features/files/components/file-header"

export default function TrashPage() {
  const t = useTranslations("files.pages")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <FileHeader title={t("trash")} type="trash" onSearch={setSearchQuery} />
      <FileBrowser type="trash" searchQuery={searchQuery} />
    </div>
  )
}
