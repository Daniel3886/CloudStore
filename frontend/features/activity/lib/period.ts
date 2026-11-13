export type AuditPeriod = number | "all"

export const DEFAULT_PERIOD: AuditPeriod = 30

export const PERIOD_OPTIONS: readonly AuditPeriod[] = [7, 30, 90, "all"]

export function periodToValue(period: AuditPeriod): string {
  return String(period)
}

export function parsePeriod(value: string): AuditPeriod {
  if (value === "all") return "all"
  const days = Number.parseInt(value, 10)
  return Number.isFinite(days) && days > 0 ? days : DEFAULT_PERIOD
}
