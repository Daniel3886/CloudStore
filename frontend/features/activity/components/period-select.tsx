"use client"

import { useTranslations } from "next-intl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PERIOD_OPTIONS, parsePeriod, periodToValue, type AuditPeriod } from "@/features/activity/lib/period"

interface PeriodSelectProps {
  value: AuditPeriod
  onChange: (period: AuditPeriod) => void
}

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  const t = useTranslations("activity.period")

  return (
    <Select value={periodToValue(value)} onValueChange={(next) => onChange(parsePeriod(next))}>
      <SelectTrigger className="w-36" aria-label={t("label")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={periodToValue(option)} value={periodToValue(option)}>
            {option === "all" ? t("all") : t("days", { days: option })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
