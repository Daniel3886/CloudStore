"use client"

import { useState } from "react"
import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function TrashPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <FileHeader title="Trash" onRefresh={handleRefresh} />
      <FileBrowser key={refreshKey} type="trash" onRefresh={handleRefresh} />
    </div>
  )
}
