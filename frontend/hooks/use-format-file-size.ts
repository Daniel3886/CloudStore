"use client"

import { useCallback } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { toSizeUnit } from "@/lib/file-size"

export function useFormatFileSize() {
  const format = useFormatter()
  const t = useTranslations("common.fileSize")

  return useCallback(
    (bytes: number) => {
      const { value, unit } = toSizeUnit(bytes)
      if (unit === "byte") return t("bytes", { count: value })
      return format.number(value, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: 2 })
    },
    [format, t],
  )
}
