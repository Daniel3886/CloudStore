"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { FileBrowser } from "@/features/files/components/file-browser"
import { FileHeader } from "@/features/files/components/file-header"

export default function FilesPage() {
  const t = useTranslations("files.pages")
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPath, setCurrentPath] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <FileHeader
        title={t("files")}
        type="all"
        onRefresh={() => setRefreshSignal((prev) => prev + 1)}
        onSearch={setSearchQuery}
        currentPath={currentPath}
      />
      <FileBrowser
        refreshSignal={refreshSignal}
        searchQuery={searchQuery}
        currentPath={currentPath}
        onCurrentPathChange={setCurrentPath}
      />
    </div>
  )
}
