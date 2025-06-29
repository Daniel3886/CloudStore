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
  accessToken: string
  refreshToken: string
  user: User
}

// Get access token from storage
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

// Get refresh token from storage
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refreshToken")
}

// Remove tokens from storage
export function clearTokens(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("userEmail")
  sessionStorage.removeItem("pendingVerificationEmail")
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAccessToken()
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

// Refresh access token using refresh token
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return false
    }

    const response = await fetch("http://localhost:8080/auth/refresh-token", {
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
      // Refresh token is invalid, clear all tokens
      clearTokens()
      return false
    }
  } catch (error) {
    console.error("Token refresh failed:", error)
    clearTokens()
    return false
  }
}

// API request with automatic token refresh
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = getAccessToken()

  // Properly type the headers object
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  // Only add auth header if access token exists
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle token refresh if needed
  if (response.status === 401 && accessToken) {
    const refreshSuccess = await refreshAccessToken()
    if (refreshSuccess) {
      // Retry original request with new token
      const newAccessToken = getAccessToken()
      if (newAccessToken) {
        headers["Authorization"] = `Bearer ${newAccessToken}`
      }
      response = await fetch(url, { ...options, headers })
    } else {
      // Refresh failed, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  return response
}

// Helper function to make authenticated API calls
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
