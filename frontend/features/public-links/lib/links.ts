export type LinkKind = "preview" | "download"

export type SizeUnit = "byte" | "kilobyte" | "megabyte" | "gigabyte" | "terabyte"

export const MAX_PREVIEW_SIZE = 5 * 1024 * 1024

const SIZE_UNITS: SizeUnit[] = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"]

export interface ExpiryInfo {
  expired: boolean
  hours: number
  minutes: number
}

export function getExpiryInfo(expiresAt: string, now: Date = new Date()): ExpiryInfo {
  const diffMs = new Date(expiresAt).getTime() - now.getTime()
  if (!(diffMs > 0)) return { expired: true, hours: 0, minutes: 0 }
  const totalMinutes = Math.floor(diffMs / 60_000)
  return { expired: false, hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
}

export function canPreview(fileSize: number): boolean {
  return fileSize <= MAX_PREVIEW_SIZE
}

export function toSizeUnit(bytes: number): { value: number; unit: SizeUnit } {
  if (!Number.isFinite(bytes) || bytes < 1024) return { value: Math.max(0, Math.round(bytes) || 0), unit: "byte" }
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1)
  return { value: Math.round((bytes / 1024 ** index) * 100) / 100, unit: SIZE_UNITS[index] }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer")
}
