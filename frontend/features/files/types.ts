export type FileType = "folder" | "image" | "pdf" | "document" | "video" | "audio" | "archive" | "file"

export type FileView = "all" | "recent" | "trash"

export interface FileItem {
  id: number
  name: string
  displayName: string
  type: FileType
  size?: number
  modified?: number
  owner?: string
  s3Key?: string
  path: string
  isFolder: boolean
}

export type FileAction = "download" | "share" | "details" | "rename" | "delete" | "restore" | "permanent-delete"
