"use client"

import { useTranslations } from "next-intl"
import { Activity, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { AuditPeriod } from "@/features/activity/lib/period"

export function AuditLogSkeleton() {
  const t = useTranslations("activity.browser")

  return (
    <div className="space-y-3" role="status" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
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
  )
}

export function AuditLogEmpty({ period }: { period: AuditPeriod }) {
  const t = useTranslations("activity.empty")

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium mb-2">{t("title")}</h3>
        <p className="text-muted-foreground">{period === "all" ? t("all") : t("period", { days: period })}</p>
      </CardContent>
    </Card>
  )
}

export function AuditLogError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("activity.error")

  return (
    <Card role="alert">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium mb-2">{t("title")}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          {t("retry")}
        </Button>
      </CardContent>
    </Card>
  )
}
