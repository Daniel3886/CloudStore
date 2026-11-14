"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { ApiError } from "@/lib/api/client"
import { getApiErrorKey } from "@/lib/api/errors"

export function useErrorMessage() {
  const t = useTranslations("common.apiErrors")

  return useCallback(
    (error: unknown, fallback: string): string => {
      if (!(error instanceof ApiError)) return fallback
      const key = getApiErrorKey(error.status, error.message)
      return key ? t(key) : fallback
    },
    [t],
  )
}
