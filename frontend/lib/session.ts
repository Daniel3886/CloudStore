const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const USER_EMAIL_KEY = "userEmail"

const isBrowser = () => typeof window !== "undefined"

export function getAccessToken(): string | null {
  return isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null
}

export function getRefreshToken(): string | null {
  return isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (!isBrowser()) return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function hasStoredSession(): boolean {
  return !!(getAccessToken() || getRefreshToken())
}

export function clearTokens(): void {
  if (!isBrowser()) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
  sessionStorage.removeItem("pendingVerificationEmail")
}

export function getUserEmail(): string | null {
  return isBrowser() ? localStorage.getItem(USER_EMAIL_KEY) : null
}

export function setUserEmail(email: string): void {
  if (isBrowser()) localStorage.setItem(USER_EMAIL_KEY, email)
}
