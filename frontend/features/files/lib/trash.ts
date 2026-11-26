const DAY_MS = 24 * 60 * 60 * 1000

/** Matches AutoCleanupService.TRASH_RETENTION_DAYS on the backend. */
export const TRASH_RETENTION_DAYS = 30

/** Days the warning colour kicks in before a trashed file is deleted for good. */
export const TRASH_WARNING_DAYS = 3

/**
 * Whole days left before the nightly cleanup removes a trashed file.
 * Returns undefined when the server did not send a purge date.
 */
export function daysUntilPurge(purgeAt: number | undefined, now: number = Date.now()): number | undefined {
  if (purgeAt == null || !Number.isFinite(purgeAt)) return undefined
  return Math.max(0, Math.ceil((purgeAt - now) / DAY_MS))
}
