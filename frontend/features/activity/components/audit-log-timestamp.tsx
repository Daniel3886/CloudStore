"use client"

import { useFormatter, useNow, useTranslations } from "next-intl"
import { Clock } from "lucide-react"
import { getTimestampDisplay } from "@/features/activity/lib/timestamp"

export function AuditLogTimestamp({ timestamp }: { timestamp: string }) {
  const t = useTranslations("activity.log")
  const format = useFormatter()
  const now = useNow({ updateInterval: 60_000 })
  const date = new Date(timestamp)
  const display = getTimestampDisplay(date, now)

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {display === "invalid" ? (
        <span>{timestamp}</span>
      ) : (
        <time dateTime={date.toISOString()} title={format.dateTime(date, { dateStyle: "full", timeStyle: "medium" })}>
          {display === "justNow"
            ? t("justNow")
            : display === "relative"
              ? format.relativeTime(date, now)
              : format.dateTime(date, { dateStyle: "short" })}{" "}
          <span className="mx-1" aria-hidden="true">
            •
          </span>{" "}
          {format.dateTime(date, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
        </time>
      )}
    </div>
  )
}
