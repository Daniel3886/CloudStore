export const LINK_LIFETIME_MS = 24 * 60 * 60 * 1000

export interface Countdown {
  hours: number
  minutes: number
  seconds: number
  /** Hours of the 24 already used, 0–24. */
  hoursUsed: number
}

export function getCountdown(expiresAt: number, now: number): Countdown {
  const ms = Math.max(0, expiresAt - now)
  const hoursLeft = Math.ceil(ms / 3_600_000)
  return {
    hours: Math.floor(ms / 3_600_000),
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    hoursUsed: Math.min(24, Math.max(0, 24 - hoursLeft)),
  }
}
