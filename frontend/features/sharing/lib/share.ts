import type { SharedFileDto, ShareStatus } from "@/features/sharing/api"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}

export function toFileId(id: string | number | undefined | null): number | null {
  if (id === undefined || id === null || id === "") return null
  const parsed = typeof id === "number" ? id : Number(id)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function getDownloadName(displayName: string): string {
  return displayName.split("/").pop() || displayName
}

export function withShareStatus(
  files: SharedFileDto[],
  permissionId: number,
  status: ShareStatus,
  changedAt: string,
): SharedFileDto[] {
  return files.map((file) =>
    file.permissionId === permissionId ? { ...file, shareStatus: status, shareStatusChangedAt: changedAt } : file,
  )
}

export function parseDate(value: string | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
