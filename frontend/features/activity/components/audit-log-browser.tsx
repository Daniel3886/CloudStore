"use client"

import { useTranslations } from "next-intl"
import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuditLogs } from "@/features/activity/hooks/use-audit-logs"
import { PeriodSelect } from "@/features/activity/components/period-select"
import { AuditLogList } from "@/features/activity/components/audit-log-list"
import { AuditLogEmpty, AuditLogError, AuditLogSkeleton } from "@/features/activity/components/audit-log-states"

export function AuditLogBrowser() {
  const t = useTranslations("activity.browser")
  const { logs, period, setPeriod, isLoading, error, refresh } = useAuditLogs()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelect value={period} onChange={setPeriod} />
          <Button variant="outline" size="icon" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{t("refresh")}</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <AuditLogSkeleton />
      ) : error ? (
        <AuditLogError message={error} onRetry={() => void refresh()} />
      ) : logs.length === 0 ? (
        <AuditLogEmpty period={period} />
      ) : (
        <AuditLogList logs={logs} />
      )}
    </div>
  )
}
