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

export const validateFileName = (name: string, isFolder: boolean): string => {
  if (!name.trim()) {
    return `${isFolder ? "Folder" : "File"} name cannot be empty.`
  }

  if (name.length > 255) {
    return `${isFolder ? "Folder" : "File"} name must be less than 255 characters.`
  }

  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return `${isFolder ? "Folder" : "File"} name contains invalid characters.`
  }

  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ]
  if (reservedNames.includes(name.toUpperCase())) {
    return `"${name}" is a reserved name and cannot be used.`
  }

  return ""
}

export const getBreadcrumbs = (currentPath: string): string[] => {
  if (!currentPath) return ["My Files"]
  return ["My Files", ...currentPath.split("/")]
}
