"use client"

import { useCallback } from "react"
import { useFormatter, useNow } from "next-intl"
import { useFormatFileSize } from "@/hooks/use-format-file-size"

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function useFileFormatters() {
  const formatSize = useFormatFileSize()
  const format = useFormatter()
  const now = useNow()

  const formatRelativeDate = useCallback(
    (date: number | Date) => {
      const value = typeof date === "number" ? new Date(date) : date
      if (now.getTime() - value.getTime() >= YEAR_MS) return format.dateTime(value, { dateStyle: "medium" })
      return format.relativeTime(value, now)
    },
    [format, now],
  )

  return { formatSize, formatRelativeDate }
}
