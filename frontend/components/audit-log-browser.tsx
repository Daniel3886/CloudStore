"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { type AuditLog, AuditLogAPI } from "@/lib/audit-log"
import {
  FileText,
  Download,
  Upload,
  Share,
  Trash2,
  Edit,
  Eye,
  FolderPlus,
  UserPlus,
  Link,
  Clock,
  Activity,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AuditLogBrowserProps {
  refreshKey?: number
}

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("upload")) return <Upload className="h-4 w-4" />
  if (actionLower.includes("download")) return <Download className="h-4 w-4" />
  if (actionLower.includes("share")) return <Share className="h-4 w-4" />
  if (actionLower.includes("delete")) return <Trash2 className="h-4 w-4" />
  if (actionLower.includes("edit") || actionLower.includes("rename")) return <Edit className="h-4 w-4" />
  if (actionLower.includes("view") || actionLower.includes("access")) return <Eye className="h-4 w-4" />
  if (actionLower.includes("folder")) return <FolderPlus className="h-4 w-4" />
  if (actionLower.includes("user")) return <UserPlus className="h-4 w-4" />
  if (actionLower.includes("link")) return <Link className="h-4 w-4" />

  return <FileText className="h-4 w-4" />
}

const getActionColor = (action: string) => {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("upload") || actionLower.includes("create"))
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  if (actionLower.includes("download") || actionLower.includes("view"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  if (actionLower.includes("share")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  if (actionLower.includes("delete")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  if (actionLower.includes("edit") || actionLower.includes("rename"))
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"

  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
}

export function AuditLogBrowser({ refreshKey }: AuditLogBrowserProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const auditLogs = await AuditLogAPI.getLogsByPeriod(Number.parseInt(period))
      setLogs(auditLogs)
    } catch (error: any) {
      console.error("Failed to fetch audit logs:", error)
      toast({
        variant: "destructive",
        title: "Failed to load activity",
        description: error.message || "Could not load activity logs",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [period, refreshKey])

  const handleRefresh = () => {
    fetchLogs()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity found for the selected period</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      {log.fileId && (
                        <Badge variant="outline" className="text-xs">
                          File ID: {log.fileId}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-foreground mb-1">{log.description}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
