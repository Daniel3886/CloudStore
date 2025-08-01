"use client"

import { useState } from "react"
import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function RecentPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <FileHeader title="Recent files" onRefresh={handleRefresh} />
      <FileBrowser key={refreshKey} type="recent" onRefresh={handleRefresh} />
    </div>
  )
}
