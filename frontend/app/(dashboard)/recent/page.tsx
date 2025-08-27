"use client"

import { useState } from "react"
import { FileHeader } from "@/components/file-header"
import { FileBrowser } from "@/components/file-browser"

export default function RecentPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
     <div className="space-y-6">
      <FileHeader title="Recent Files" type="recent" onRefresh={handleRefresh} />
      <FileBrowser key={`recent-${refreshKey}`} type="recent" />
    </div>
  )
}
