"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { fetchAllAuditLogs, fetchAuditLogsByPeriod, type AuditLog } from "@/features/activity/api"
import { DEFAULT_PERIOD, type AuditPeriod } from "@/features/activity/lib/period"
import { useErrorMessage } from "@/hooks/use-error-message"

export function useAuditLogs(initialPeriod: AuditPeriod = DEFAULT_PERIOD) {
  const t = useTranslations("activity.error")
  const errorMessage = useErrorMessage()
  const fallbackMessage = t("fallback")
  const [period, setPeriod] = useState<AuditPeriod>(initialPeriod)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const latestRequest = useRef(0)

  const load = useCallback(
    async (target: AuditPeriod) => {
      const requestId = ++latestRequest.current
      setIsLoading(true)
      setError(null)
      try {
        const result = target === "all" ? await fetchAllAuditLogs() : await fetchAuditLogsByPeriod(target)
        if (requestId === latestRequest.current) setLogs(result)
      } catch (err) {
        if (requestId === latestRequest.current) {
          setLogs([])
          setError(errorMessage(err, fallbackMessage))
        }
      } finally {
        if (requestId === latestRequest.current) setIsLoading(false)
      }
    },
    [errorMessage, fallbackMessage],
  )

  useEffect(() => {
    void load(period)
  }, [load, period])

  const refresh = useCallback(() => load(period), [load, period])

  return { logs, period, setPeriod, isLoading, error, refresh }
}
