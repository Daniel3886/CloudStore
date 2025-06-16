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

// Get token from storage
export function getToken(): string | null {
  if (typeof window === "undefined") return null

  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

// Get refresh token from storage
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null

  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken")
}

// Remove tokens from storage
export function clearTokens(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
  sessionStorage.removeItem("token")
  sessionStorage.removeItem("refreshToken")
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken()
}

// Decode JWT token (basic implementation)
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

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  return Date.now() >= decoded.exp * 1000
}

// API request with authentication
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle token refresh if needed
  if (response.status === 401) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        // API Call: POST /api/auth/refresh
        // Expected payload: { refreshToken }
        // Expected response: { token, refreshToken? }

        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()

          // Update tokens in storage
          const storage = localStorage.getItem("token") ? localStorage : sessionStorage
          storage.setItem("token", data.token)
          if (data.refreshToken) {
            storage.setItem("refreshToken", data.refreshToken)
          }

          // Retry original request with new token
          headers["Authorization"] = `Bearer ${data.token}`
          return fetch(url, { ...options, headers })
        }
      } catch (error) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens()
        window.location.href = "/login"
      }
    } else {
      // No refresh token, redirect to login
      clearTokens()
      window.location.href = "/login"
    }
  }

  return response
}
