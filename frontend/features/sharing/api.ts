import { ApiError, api } from "@/lib/api/client"

export interface ShareFileRequest {
  fileId: number
  targetUserEmail: string
  message?: string
}

export type ShareStatus = "PENDING" | "ACCEPTED" | "DECLINED"

export interface SharedFileDto {
  permissionId: number
  fileId: number
  displayName: string
  sharedBy: string
  s3Key: string
  message?: string
  sharedAt: string
  sharedWithEmail: string
  shareStatus: ShareStatus
  shareStatusChangedAt?: string
}

export interface MessageUpdateRequest {
  message: string
}

export const sharingApi = {
  async shareFile(request: ShareFileRequest): Promise<void> {
    await api.post("/share", { json: request, errorMessage: "Failed to share file" })
  },

  getSharedFiles(): Promise<SharedFileDto[]> {
    return api.get<SharedFileDto[]>("/share/received", { errorMessage: "Failed to fetch shared files" })
  },

  async acceptShare(permissionId: number): Promise<void> {
    await api.post(`/share/accept/${permissionId}`, { errorMessage: "Failed to accept share" })
  },

  async declineShare(permissionId: number): Promise<void> {
    await api.post(`/share/decline/${permissionId}`, { errorMessage: "Failed to decline share" })
  },

  async getFileSharedUsers(fileId: number): Promise<string[]> {
    try {
      return await api.get<string[]>(`/share/${fileId}/users`, { errorMessage: "Failed to fetch shared users" })
    } catch (error) {
      if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return []
      throw error
    }
  },

  async revokeAccess(fileId: number, email: string): Promise<void> {
    await api.delete(`/share/${fileId}/user/${encodeURIComponent(email)}`, { errorMessage: "Failed to revoke access" })
  },

  async updateMessage(fileId: number, targetUserId: number, message: string): Promise<void> {
    await api.put(`/share/${fileId}/shared/${targetUserId}/message`, {
      json: { message } satisfies MessageUpdateRequest,
      errorMessage: "Failed to update message",
    })
  },

  async removeMessage(fileId: number, email: string): Promise<void> {
    await api.delete(`/share/${fileId}/user/${encodeURIComponent(email)}/message`, {
      errorMessage: "Failed to remove message",
    })
  },
}
