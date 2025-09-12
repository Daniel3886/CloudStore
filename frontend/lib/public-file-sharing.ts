import { apiUrl } from "@/lib/config"
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

    const response = await makeAuthenticatedRequest(apiUrl(`/share/public/${fileId}`), {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to generate public link")
    }

    const linkResponse = await response.json()

    return linkResponse
  }

  static async getActiveLinks(): Promise<PublicFileAccessToken[]> {

    const response = await makeAuthenticatedRequest(apiUrl("/share/public/list"))

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to fetch active links")
    }

    const links = await response.json()

    return links
  }

  static async revokePublicLink(token: string): Promise<void> {

    const response = await makeAuthenticatedRequest(apiUrl(`/share/public/access/${token}`), {
      method: "DELETE",
    })


    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to revoke public link")
    }

    const responseText = await response.text()
  }

  static getPublicFileUrl(token: string, preview = false): string {
    const baseUrl = apiUrl(`/share/public/access/${token}`)
    return preview ? `${baseUrl}?preview=true` : baseUrl
  }
}
