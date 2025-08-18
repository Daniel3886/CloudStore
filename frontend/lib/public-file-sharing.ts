export interface PublicLinkResponse {
  previewLink?: string
  downloadLink: string
  message?: string
}

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
    console.log("🔍 [PUBLIC API] Generating public link for file ID:", fileId)

    const response = await makeAuthenticatedRequest(`http://localhost:8080/share/public/${fileId}`, {
      method: "POST",
    })

    console.log("🔍 [PUBLIC API] Generate public link response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [PUBLIC API] Generate public link error:", errorText)
      throw new Error(errorText || "Failed to generate public link")
    }

    const linkResponse = await response.json()
    console.log("✅ [PUBLIC API] Generate public link success:", linkResponse)

    return linkResponse
  }

  static async getActiveLinks(): Promise<PublicFileAccessToken[]> {
    console.log("🔍 [PUBLIC API] Getting active public links")

    const response = await makeAuthenticatedRequest("http://localhost:8080/share/public/list")

    console.log("🔍 [PUBLIC API] Get active links response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [PUBLIC API] Get active links error:", errorText)
      throw new Error(errorText || "Failed to fetch active links")
    }

    const links = await response.json()
    console.log("✅ [PUBLIC API] Get active links success:", links.length, "links")

    return links
  }

  static async revokePublicLink(token: string): Promise<void> {
    console.log("🔍 [PUBLIC API] Revoking public link with token:", token)

    const response = await makeAuthenticatedRequest(`http://localhost:8080/share/public/access/${token}`, {
      method: "DELETE",
    })

    console.log("🔍 [PUBLIC API] Revoke public link response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [PUBLIC API] Revoke public link error:", errorText)
      throw new Error(errorText || "Failed to revoke public link")
    }

    const responseText = await response.text()
    console.log("✅ [PUBLIC API] Revoke public link success:", responseText)
  }

  static getPublicFileUrl(token: string, preview = false): string {
    const baseUrl = `http://localhost:8080/share/public/access/${token}`
    return preview ? `${baseUrl}?preview=true` : baseUrl
  }
}
