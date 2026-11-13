import type { FileType } from "@/features/files/types"

const EXTENSION_TYPES: Record<string, FileType> = {
  pdf: "pdf",
  ...Object.fromEntries(["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].map((ext) => [ext, "image"])),
  ...Object.fromEntries(["doc", "docx", "txt", "rtf", "odt"].map((ext) => [ext, "document"])),
  ...Object.fromEntries(["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].map((ext) => [ext, "video"])),
  ...Object.fromEntries(["mp3", "wav", "flac", "aac", "ogg", "wma"].map((ext) => [ext, "audio"])),
  ...Object.fromEntries(["zip", "rar", "7z", "tar", "gz", "bz2"].map((ext) => [ext, "archive"])),
}

export function getFileType(fileName: string): FileType {
  const dotIndex = fileName.lastIndexOf(".")
  if (dotIndex < 0) return "file"
  return EXTENSION_TYPES[fileName.slice(dotIndex + 1).toLowerCase()] ?? "file"
}
