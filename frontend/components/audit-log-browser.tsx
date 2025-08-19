"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
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
  UserPlus,
  Link,
  MessageSquare,
} from "lucide-react"
import { fetchAuditLogsByPeriod, shouldShowFileName, type AuditLog } from "@/lib/audit-log"

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("upload")) return Upload
  if (actionLower.includes("download") || actionLower.includes("access")) return Download
  if (actionLower.includes("share")) return Share2
  if (actionLower.includes("delete") || actionLower.includes("trash")) return Trash2
  if (
    actionLower.includes("edit") ||
    actionLower.includes("rename") ||
    actionLower.includes("update") ||
    actionLower.includes("move")
  )
    return Edit
  if (actionLower.includes("restore")) return RefreshCw
  if (actionLower.includes("view") || actionLower.includes("access")) return Eye
  if (actionLower.includes("folder") || actionLower.includes("create")) return FolderPlus
  if (actionLower.includes("register")) return UserPlus
  if (actionLower.includes("link") || actionLower.includes("public")) return Link
  if (actionLower.includes("message")) return MessageSquare
  if (actionLower.includes("revoke")) return Trash2

  return Activity
}

const getActionColor = (action: string) => {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("upload") || actionLower.includes("create") || actionLower.includes("register"))
    return "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800"
  if (actionLower.includes("download") || actionLower.includes("access"))
    return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800"
  if (actionLower.includes("share") || actionLower.includes("link") || actionLower.includes("public"))
    return "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800"
  if (actionLower.includes("delete") || actionLower.includes("trash") || actionLower.includes("revoke"))
    return "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800"
  if (
    actionLower.includes("edit") ||
    actionLower.includes("rename") ||
    actionLower.includes("update") ||
    actionLower.includes("move") ||
    actionLower.includes("message")
  )
    return "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800"
  if (actionLower.includes("restore"))
    return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800"

  return "bg-slate-500/10 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-800"
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

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const dateStr = date.toLocaleDateString()
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
  return { dateStr, timeStr }
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
          <Button variant="outline" size="icon" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4" />
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
            {logs.map((log, index) => {
              const ActionIcon = getActionIcon(log.action)
              const actionColor = getActionColor(log.action)
              const showFileName = shouldShowFileName(log.action) && log.fileDisplayName
              const relativeTime = formatRelativeTime(log.timestamp)
              const { timeStr } = formatDateTime(log.timestamp)

              return (
                <Card key={`${log.action}-${log.timestamp}-${index}`} className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-full bg-muted">
                        <ActionIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className={actionColor}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                          {showFileName && (
                            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2 py-1 rounded">
                              <FileText className="h-3 w-3" />
                              <span className="font-medium">{log.fileDisplayName}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-foreground mb-1">{log.description}</p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span title={formatFullTimestamp(log.timestamp)}>
                            {relativeTime} <span className="mx-1">•</span> {timeStr}
                          </span>
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
