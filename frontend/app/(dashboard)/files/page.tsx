"use client"

import { useState } from "react"
import { FileBrowser } from "@/components/file-browser"
import { FileHeader } from "@/components/file-header"

export default function FilesPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPath, setCurrentPath] = useState("")

  const handleRefresh = () => {
    console.log("FilesPage: Refresh triggered, updating key from", refreshKey, "to", refreshKey + 1)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <FileHeader 
        title="My Files" 
        type="all" 
        onRefresh={handleRefresh} 
        onSearch={setSearchQuery}
        currentPath={currentPath}
      />
      <FileBrowser 
        key={refreshKey} 
        onRefresh={handleRefresh} 
        searchQuery={searchQuery}
        currentPath={currentPath}
        onCurrentPathChange={setCurrentPath}
      />
    </div>
  )
}