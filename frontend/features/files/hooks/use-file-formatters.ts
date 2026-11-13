"use client"

import { useCallback } from "react"
import { useFormatter, useNow, useTranslations } from "next-intl"

const SIZE_UNITS = ["Bytes", "KB", "MB", "GB", "TB"] as const
const YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function useFileFormatters() {
  const t = useTranslations("files")
  const format = useFormatter()
  const now = useNow()

  const formatSize = useCallback(
    (bytes: number) => {
      const exponent = bytes > 0 ? Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1) : 0
      const size = format.number(bytes / 1024 ** exponent, { maximumFractionDigits: 2 })
      return t("size", { size, unit: SIZE_UNITS[exponent] })
    },
    [format, t],
  )

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
