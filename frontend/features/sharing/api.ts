import { ApiError, api } from "@/lib/api/client"
import { filesApi, type FileResponse } from "@/features/files/api"

export interface ShareFileRequest {
  fileId: number
  targetUserEmail: string
  message?: string
}

export interface SharedFileDto {
  permissionId: number
  fileId: number
  displayName: string
  sharedBy: string
  s3Key: string
  message?: string
  sharedAt: string
  sharedWithEmail: string
  shareStatus: "PENDING" | "ACCEPTED" | "DECLINED"
  shareStatusChangedAt?: string
}

export interface MessageUpdateRequest {
  message: string
}

export class FileSharingAPI {
  static async shareFile(request: ShareFileRequest): Promise<void> {
    await api.post("/share", { json: request, errorMessage: "Failed to share file" })
  }

  static getSharedFiles(): Promise<SharedFileDto[]> {
    return api.get<SharedFileDto[]>("/share/received", { errorMessage: "Failed to fetch shared files" })
  }

  static async acceptShare(permissionId: number): Promise<void> {
    await api.post(`/share/accept/${permissionId}`, { errorMessage: "Failed to accept share" })
  }

  static async declineShare(permissionId: number): Promise<void> {
    await api.post(`/share/decline/${permissionId}`, { errorMessage: "Failed to decline share" })
  }

  static async getFileSharedUsers(fileId: number): Promise<string[]> {
    try {
      return await api.get<string[]>(`/share/${fileId}/users`, { errorMessage: "Failed to fetch shared users" })
    } catch (error) {
      if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return []
      throw error
    }
  }

  static async revokeAccess(fileId: number, email: string): Promise<void> {
    await api.delete(`/share/${fileId}/user/${encodeURIComponent(email)}`, { errorMessage: "Failed to revoke access" })
  }

  static async updateMessage(fileId: number, targetUserId: number, message: string): Promise<void> {
    await api.put(`/share/${fileId}/shared/${targetUserId}/message`, {
      json: { message } satisfies MessageUpdateRequest,
      errorMessage: "Failed to update message",
    })
  }

  static async removeMessage(fileId: number, email: string): Promise<void> {
    await api.delete(`/share/${fileId}/user/${encodeURIComponent(email)}/message`, {
      errorMessage: "Failed to remove message",
    })
  }

  static async getUserFiles(): Promise<FileResponse[]> {
    try {
      return await filesApi.list()
    } catch {
      return []
    }
  }
}
