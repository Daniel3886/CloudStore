"use client"

import { useTranslations } from "next-intl"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { shouldShowFileName, type AuditLog } from "@/features/activity/api"
import { AuditLogTimestamp } from "@/features/activity/components/audit-log-timestamp"
import {
  ACTION_TONE_CLASSES,
  formatActionCode,
  getActionIcon,
  getActionTone,
  isKnownAction,
} from "@/features/activity/lib/actions"

export function AuditLogRow({ log }: { log: AuditLog }) {
  const t = useTranslations("activity")
  const ActionIcon = getActionIcon(log.action)
  const label = isKnownAction(log.action) ? t(`actions.${log.action}`) : formatActionCode(log.action)
  const fileName = shouldShowFileName(log.action) ? log.fileDisplayName : undefined

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-muted">
            <ActionIcon className="h-4 w-4" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className={ACTION_TONE_CLASSES[getActionTone(log.action)]} title={log.action}>
                {label}
              </Badge>
              {fileName && (
                <div
                  className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-2 py-1 rounded"
                  aria-label={t("log.file", { name: fileName })}
                >
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  <span className="font-medium">{fileName}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-foreground mb-1">{log.description}</p>

            <AuditLogTimestamp timestamp={log.timestamp} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
