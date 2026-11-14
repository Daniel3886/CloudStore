import { api, buildUrl } from "@/lib/api/client"

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

export const publicLinksApi = {
  generatePublicLink(fileId: number): Promise<PublicLinkResponse> {
    return api.post<PublicLinkResponse>(`/share/public/${fileId}`)
  },

  getActiveLinks(): Promise<PublicFileAccessToken[]> {
    return api.get<PublicFileAccessToken[]>("/share/public/list")
  },

  async revokePublicLink(token: string): Promise<void> {
    await api.delete(`/share/public/access/${encodeURIComponent(token)}`)
  },

  getPublicFileUrl(token: string, preview = false): string {
    return buildUrl(`/share/public/access/${encodeURIComponent(token)}`, preview ? { preview: true } : undefined)
  },
}
