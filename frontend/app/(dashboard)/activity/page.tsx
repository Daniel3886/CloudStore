"use client"

import { AuditLogBrowser } from "@/components/audit-log-browser"

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">View your recent file activity and system events</p>
      </div>
      <AuditLogBrowser />
    </div>
  )
}
