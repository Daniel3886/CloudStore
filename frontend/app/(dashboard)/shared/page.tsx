"use client"

import { useState } from "react"
import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function SharedPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <FileHeader title="Shared with me" onRefresh={handleRefresh} />
      <FileBrowser key={refreshKey} type="shared" onRefresh={handleRefresh} />
    </div>
  )
}
