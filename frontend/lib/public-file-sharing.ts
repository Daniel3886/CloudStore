export interface PublicLinkResponse {
  previewLink?: string
  downloadLink: string
  message?: string
}

// interface PublicFileAccessToken {
//   file: {
//     id: number    
//     name: string
//     displayName?: string
//     size?: number
//   }
// }

// public-file-sharing.ts
export interface PublicFileAccessToken {
  id: number
  token: string
  file: {
    id: number
    displayName: string
    s3Key: string
    size: number
  }
  expiresAt: string
  active: boolean
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

export class PublicFileSharingAPI {
  static async generatePublicLink(fileId: number): Promise<PublicLinkResponse> {
    const response = await makeAuthenticatedRequest(`http://localhost:8080/share/public/${fileId}`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    return response.json() as Promise<PublicLinkResponse>
  }

  static async getActiveLinks(): Promise<PublicFileAccessToken[]> {
    const response = await makeAuthenticatedRequest("http://localhost:8080/share/public/list")

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch active links")
    }

   return response.json() as Promise<PublicFileAccessToken[]>
  }

  static async revokePublicLink(token: string): Promise<void> {

    const response = await makeAuthenticatedRequest(`http://localhost:8080/share/public/access/${token}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [PUBLIC API] Revoke public link error:", errorText)
      throw new Error(errorText || "Failed to revoke public link")
    }

    const responseText = await response.text()
  }

  static getPublicFileUrl(token: string, preview = false): string {
    const baseUrl = `http://localhost:8080/share/public/access/${token}`
    return preview ? `${baseUrl}?preview=true` : baseUrl
  }
}
