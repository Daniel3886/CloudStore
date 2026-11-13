"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { AuditLog } from "@/features/activity/api"
import { AuditLogRow } from "@/features/activity/components/audit-log-row"

export function AuditLogList({ logs }: { logs: AuditLog[] }) {
  return (
    <ScrollArea className="h-[600px]">
      <ul className="space-y-3">
        {logs.map((log, index) => (
          <li key={`${log.action}-${log.timestamp}-${index}`}>
            <AuditLogRow log={log} />
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
