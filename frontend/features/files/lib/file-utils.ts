export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "Invalid date"
  }

  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "Today"
  } else if (diffInDays === 1) {
    return "Yesterday"
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return months === 1 ? "1 month ago" : `${months} months ago`
  } else {
    return dateObj.toLocaleDateString()
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".")
  return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ""
}

export const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".")
  return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
}

export const MAX_FILE_NAME_LENGTH = 255
export const INVALID_FILE_NAME_CHARS = '< > : " / \\ | ? *'

const INVALID_CHARS_PATTERN = /[<>:"/\\|?*]/
const RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, i) => `COM${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `LPT${i + 1}`),
])

export type FileNameError =
  | { key: "empty" | "tooLong" | "invalidChars"; values: { kind: "file" | "folder"; max: number; chars: string } }
  | { key: "reserved"; values: { name: string } }

export function validateFileName(name: string, isFolder: boolean): FileNameError | null {
  const values = {
    kind: isFolder ? "folder" : "file",
    max: MAX_FILE_NAME_LENGTH,
    chars: INVALID_FILE_NAME_CHARS,
  } as const
  if (!name.trim()) return { key: "empty", values }
  if (name.length > MAX_FILE_NAME_LENGTH) return { key: "tooLong", values }
  if (INVALID_CHARS_PATTERN.test(name)) return { key: "invalidChars", values }
  if (RESERVED_NAMES.has(name.toUpperCase())) return { key: "reserved", values: { name } }
  return null
}

export function joinPath(parent: string, name: string): string {
  return parent ? `${parent}/${name}` : name
}

export function splitPath(path: string): { parent: string; name: string } {
  const parts = path.split("/")
  const name = parts.pop() || path
  return { parent: parts.join("/"), name }
}

export function getUniqueFileName(fileName: string, takenNames: ReadonlySet<string>): string {
  if (!takenNames.has(fileName)) return fileName
  const extension = getFileExtension(fileName)
  const base = getFileNameWithoutExtension(fileName)
  let counter = 1
  while (takenNames.has(`${base} (${counter})${extension}`)) counter++
  return `${base} (${counter})${extension}`
}
