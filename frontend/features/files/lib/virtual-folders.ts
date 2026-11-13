import { getUserEmail } from "@/lib/session"

const isBrowser = () => typeof window !== "undefined"

export function getVirtualFoldersKey(): string {
  const userEmail = getUserEmail()
  return userEmail ? `virtualFolders_${userEmail}` : "virtualFolders"
}

export function getVirtualFolders(): string[] {
  if (!isBrowser()) return []
  const saved = localStorage.getItem(getVirtualFoldersKey())
  if (!saved) return []
  try {
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

export function setVirtualFolders(folders: string[]): void {
  if (!isBrowser()) return
  localStorage.setItem(getVirtualFoldersKey(), JSON.stringify(folders))
}
