// Authentication utility functions and types

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
  token: string
  refreshToken?: string
  user: User
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null

  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null

  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
}

export function clearTokens(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("authToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("userEmail")
}

export function isAuthenticated(): boolean {
  return !!getToken()
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

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        // API Call: POST /auth/refresh
        // Expected payload: { refreshToken }
        // Expected response: { token, refreshToken? }

        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()

          const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage
          storage.setItem("authToken", data.token)
          if (data.refreshToken) {
            storage.setItem("refreshToken", data.refreshToken)
          }

          headers["Authorization"] = `Bearer ${data.token}`
          return fetch(url, { ...options, headers })
        }
      } catch (error) {
        clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    } else {
      clearTokens()
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
