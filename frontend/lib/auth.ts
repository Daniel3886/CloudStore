import { apiUrl } from "@/lib/config"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refreshToken")
}

export function clearTokens(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("userEmail")
  sessionStorage.removeItem("pendingVerificationEmail")
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userEmail")
}

export function getVirtualFoldersKey(): string {
  const userEmail = getUserEmail()
  return userEmail ? `virtualFolders_${userEmail}` : "virtualFolders"
}

export function getVirtualFolders(): string[] {
  if (typeof window === "undefined") return []
  const key = getVirtualFoldersKey()
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : []
}

export function setVirtualFolders(folders: string[]): void {
  if (typeof window === "undefined") return
  const key = getVirtualFoldersKey()
  localStorage.setItem(key, JSON.stringify(folders))
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

export function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  return Date.now() >= decoded.exp * 1000
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return false
    }

    const response = await fetch(apiUrl("/auth/refresh-token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem("accessToken", data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken)
      }
      return true
    } else {
      clearTokens()
      return false
    }
  } catch (error) {
    console.error("Token refresh failed:", error)
    clearTokens()
    return false
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = getAccessToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401 && accessToken) {
    const refreshSuccess = await refreshAccessToken()
    if (refreshSuccess) {
      const newAccessToken = getAccessToken()
      if (newAccessToken) {
        headers["Authorization"] = `Bearer ${newAccessToken}`
      }
      response = await fetch(url, { ...options, headers })
    } else {
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  return response
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; error?: string }> {
  try {
    const response = await authenticatedFetch(endpoint, options)

    if (!response.ok) {
      const errorText = await response.text()
      return { data: null as T, error: errorText || `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error: any) {
    return { data: null as T, error: error.message || "Network error" }
  }
}
