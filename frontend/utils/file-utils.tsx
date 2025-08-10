export const formatSize = (bytes: number | null): string => {
  if (bytes === null) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return `${isFolder ? "Folder" : "File"} name contains invalid characters.`
  }

  // Check for reserved names (Windows)
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
