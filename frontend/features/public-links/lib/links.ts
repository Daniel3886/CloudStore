export type LinkKind = "preview" | "download"

export const MAX_PREVIEW_SIZE = 5 * 1024 * 1024

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
