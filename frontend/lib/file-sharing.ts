import { apiUrl } from "@/lib/config"
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

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  const accessToken = localStorage.getItem("accessToken")
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })
}

export class FileSharingAPI {
  static async shareFile(request: ShareFileRequest): Promise<void> {
    const response = await makeAuthenticatedRequest(apiUrl("/share"), {
      method: "POST",
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to share file")
    }

    const responseText = await response.text()
  }

  static async getSharedFiles(): Promise<SharedFileDto[]> {
    const response = await makeAuthenticatedRequest(apiUrl("/share/received"))

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch shared files")
    }

    const files = await response.json()
    return files
  }

  static async acceptShare(permissionId: number): Promise<void> {
    const response = await makeAuthenticatedRequest(apiUrl(`/share/accept/${permissionId}`), {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to accept share")
    }
  }

  static async declineShare(permissionId: number): Promise<void> {
    const response = await makeAuthenticatedRequest(apiUrl(`/share/decline/${permissionId}`), {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to decline share")
    }
  }

  static async getFileSharedUsers(fileId: number): Promise<string[]> {
    const response = await makeAuthenticatedRequest(apiUrl(`/share/${fileId}/users`))

    if (!response.ok) {
      const errorText = await response.text()

      if (response.status === 404 || response.status === 403) {
        return []
      }
      throw new Error(errorText || "Failed to fetch shared users")
    }

    const users = await response.json()
    return users
  }

  static async revokeAccess(fileId: number, email: string): Promise<void> {
    const response = await makeAuthenticatedRequest(
      apiUrl(`/share/${fileId}/user/${encodeURIComponent(email)}`),
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to revoke access")
    }

    const responseText = await response.text()
  }

  static async updateMessage(fileId: number, targetUserId: number, message: string): Promise<void> {
    const response = await makeAuthenticatedRequest(
      apiUrl(`/share/${fileId}/shared/${targetUserId}/message`),
      {
        method: "PUT",
        body: JSON.stringify({ message }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to update message")
    }

    const responseText = await response.text()
  }

  static async removeMessage(fileId: number, email: string): Promise<void> {
    const response = await makeAuthenticatedRequest(
      apiUrl(`/share/${fileId}/user/${encodeURIComponent(email)}/message`),
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to remove message")
    }

    const responseText = await response.text()
  }

  static async getUserFiles(): Promise<any[]> {
    try {
      const response = await makeAuthenticatedRequest(apiUrl("/file/list"))
      if (!response.ok) {
        const errorText = await response.text()
        return []
      }

      const files = await response.json()
      return files
    } catch (error) {
      return []
    }
  }
}
