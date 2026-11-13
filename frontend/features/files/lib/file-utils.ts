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
