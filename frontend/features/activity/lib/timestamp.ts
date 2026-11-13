const MINUTE_MS = 60 * 1000
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export type TimestampDisplay = "invalid" | "justNow" | "relative" | "date"

export function getTimestampDisplay(date: Date, now: Date): TimestampDisplay {
  const time = date.getTime()
  if (Number.isNaN(time)) return "invalid"
  const diff = now.getTime() - time
  if (diff < MINUTE_MS) return "justNow"
  if (diff < WEEK_MS) return "relative"
  return "date"
}
