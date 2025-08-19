"use client"

import { useState } from "react"
import { FileHeader } from "@/components/file-header"
import { FileBrowser } from "@/components/file-browser"
import { AuditLogBrowser } from "@/components/audit-log-browser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Activity } from "lucide-react"

export default function RecentPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <FileHeader title="Recent Activity" type="recent" onRefresh={handleRefresh} />

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Files
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          <FileBrowser key={`files-${refreshKey}`} type="recent" />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <AuditLogBrowser />
        </TabsContent>
      </Tabs>
    </div>
  )
}
