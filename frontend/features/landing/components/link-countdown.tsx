"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { getCountdown } from "@/features/landing/lib/countdown"

/** Ticks once a second. Starts from a fixed time so server and client render the same first frame. */
export function useNow(start: number) {
  const [now, setNow] = useState(start)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

interface LinkCountdownCardProps {
  /** Milliseconds from page load until the sample link expires. */
  remainingMs: number
  className?: string
}

export function LinkCountdownCard({ remainingMs, className }: LinkCountdownCardProps) {
  const t = useTranslations("landing.preview")
  const [expiresAt] = useState(() => Date.now() + remainingMs)
  const now = useNow(expiresAt - remainingMs)
  const { hours, minutes, seconds, hoursUsed } = getCountdown(expiresAt, now)

  return (
    <div className={cn("grid gap-3 rounded-xl border bg-card p-4 shadow-xl shadow-black/30", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-display font-bold">{t("linkTitle")}</span>
        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">{t("anyone")}</span>
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
        <span className="truncate">files.your-server.home/s/7f3a9c2e</span>
      </div>
      <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[3px]" aria-hidden>
        {Array.from({ length: 24 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-3.5 rounded-[3px]",
              index < hoursUsed ? "bg-muted" : "bg-warning",
              index === hoursUsed && "outline outline-1 outline-offset-2 outline-warning motion-safe:animate-pulse",
            )}
          />
        ))}
      </div>
      <div className="flex justify-between gap-3 text-xs text-muted-foreground">
        <span>{t("expires")}</span>
        <strong className="font-semibold tabular-nums text-warning">
          {t("left", { hours, minutes: String(minutes).padStart(2, "0"), seconds: String(seconds).padStart(2, "0") })}
        </strong>
      </div>
    </div>
  )
}
