"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Download,
  Share2,
  Trash2,
  Edit,
  Eye,
  FolderPlus,
  RefreshCw,
  Activity,
  Clock,
  FileText,
} from "lucide-react"
import { fetchAuditLogsByPeriod, type AuditLog } from "@/lib/audit-log"
import { toast } from "@/components/ui/use-toast"

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("upload")) return Upload
  if (actionLower.includes("download")) return Download
  if (actionLower.includes("share")) return Share2
  if (actionLower.includes("delete") || actionLower.includes("trash")) return Trash2
  if (actionLower.includes("edit") || actionLower.includes("rename") || actionLower.includes("update")) return Edit
  if (actionLower.includes("view") || actionLower.includes("access")) return Eye
  if (actionLower.includes("folder") || actionLower.includes("create")) return FolderPlus

  return Activity
}

const getActionColor = (action: string) => {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("upload") || actionLower.includes("create"))
    return "bg-green-100 text-green-800 border-green-200"
  if (actionLower.includes("download") || actionLower.includes("access"))
    return "bg-blue-100 text-blue-800 border-blue-200"
  if (actionLower.includes("share")) return "bg-purple-100 text-purple-800 border-purple-200"
  if (actionLower.includes("delete") || actionLower.includes("trash")) return "bg-red-100 text-red-800 border-red-200"
  if (actionLower.includes("edit") || actionLower.includes("rename") || actionLower.includes("update"))
    return "bg-orange-100 text-orange-800 border-orange-200"

  return "bg-gray-100 text-gray-800 border-gray-200"
}

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString()
}

const formatFullTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

export function AuditLogBrowser() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number>(30)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const auditLogs = await fetchAuditLogsByPeriod(period)
      setLogs(auditLogs)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to load activity logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Activity Log</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period.toString()} onValueChange={(value) => setPeriod(Number.parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            Refresh <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activity found</h3>
            <p className="text-muted-foreground">No activities recorded in the last {period} days.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {logs.map((log) => {
              const ActionIcon = getActionIcon(log.action)
              const actionColor = getActionColor(log.action)

              return (
                <Card key={log.id} className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-full bg-muted">
                        <ActionIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={actionColor}>
                            {log.action}
                          </Badge>
                          {log.fileId && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>File ID: {log.fileId}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-foreground mb-1">{log.description}</p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span title={formatFullTimestamp(log.timestamp)}>{formatRelativeTime(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
