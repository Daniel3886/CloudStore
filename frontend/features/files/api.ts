import { api } from "@/lib/api/client"

export interface FileResponse {
  id: number
  key: string
  size?: number
  lastModified?: string | number
  displayName: string
}

export const filesApi = {
  list: () => api.get<FileResponse[]>("/file/list"),

  listTrash: () => api.get<FileResponse[]>("/file/trash"),

  download: (s3Key: string) => api.blob("/file/download", { query: { s3Key } }),

  upload(file: File, fileName: string) {
    const formData = new FormData()
    formData.append("file", file, fileName)
    return api.post<string>("/file/upload", { body: formData })
  },

  moveToTrash: (s3Key: string) => api.delete<string>("/file/delete", { query: { fileName: s3Key } }),

  deleteFolder: (folderPath: string) => api.delete<string>("/file/delete-folder", { query: { folderPath } }),

  rename: (s3Key: string, newDisplayName: string) =>
    api.patch<string>("/file/rename", { query: { s3Key, newDisplayName } }),

  renameFolder: (oldFolderPath: string, newFolderPath: string) =>
    api.patch<string>("/file/rename-folder", { query: { oldFolderPath, newFolderPath } }),

  restore: (s3Key: string) => api.post<string>("/file/restore", { query: { s3Key } }),

  deletePermanently: (s3Key: string) => api.delete<string>(`/file/${encodeURIComponent(s3Key)}/permanent`),
}
