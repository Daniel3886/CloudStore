import { API_BASE_URL } from "@/lib/config"
import { extractErrorMessage, type ApiErrorBody } from "@/lib/api-error"
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth"

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  query?: QueryParams
  json?: unknown
  body?: BodyInit
  auth?: boolean
  errorMessage?: string
  signal?: AbortSignal
}

type SessionExpiredListener = () => void

const sessionExpiredListeners = new Set<SessionExpiredListener>()
let refreshInFlight: Promise<boolean> | null = null

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener)
  return () => {
    sessionExpiredListeners.delete(listener)
  }
}

export function buildUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function performRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(buildUrl("/auth/refresh-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return false

    const data = (await response.json()) as { accessToken?: string; refreshToken?: string }
    if (!data.accessToken) return false

    setTokens(data.accessToken, data.refreshToken ?? refreshToken)
    return true
  } catch {
    return false
  }
}

function expireSession(): void {
  clearTokens()
  sessionExpiredListeners.forEach((listener) => listener())
}

async function send(path: string, options: RequestOptions, accessToken: string | null): Promise<Response> {
  const headers = new Headers({ Accept: "application/json, text/plain, */*" })
  let body = options.body

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json")
    body = JSON.stringify(options.json)
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.")
  }
}

async function toApiError(response: Response, fallback?: string): Promise<ApiError> {
  const text = await response.text().catch(() => "")
  let body: ApiErrorBody | null = null
  try {
    body = text ? (JSON.parse(text) as ApiErrorBody) : null
  } catch {
    body = null
  }
  const message = extractErrorMessage(text, fallback ?? `Request failed (${response.status})`)
  return new ApiError(response.status, message, body)
}

export async function apiRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  const authenticated = options.auth ?? true
  let response = await send(path, options, authenticated ? getAccessToken() : null)

  if (authenticated && response.status === 401) {
    const refreshed = await refreshSession()
    if (refreshed) {
      response = await send(path, options, getAccessToken())
    }
    if (!refreshed || response.status === 401) {
      expireSession()
    }
  }

  if (!response.ok) {
    throw await toApiError(response, options.errorMessage)
  }
  return response
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }
  return (await response.text()) as T
}

type MethodOptions = Omit<RequestOptions, "method">

export const api = {
  get: <T>(path: string, options?: MethodOptions) =>
    apiRequest(path, { ...options, method: "GET" }).then((r) => parseBody<T>(r)),
  post: <T>(path: string, options?: MethodOptions) =>
    apiRequest(path, { ...options, method: "POST" }).then((r) => parseBody<T>(r)),
  put: <T>(path: string, options?: MethodOptions) =>
    apiRequest(path, { ...options, method: "PUT" }).then((r) => parseBody<T>(r)),
  patch: <T>(path: string, options?: MethodOptions) =>
    apiRequest(path, { ...options, method: "PATCH" }).then((r) => parseBody<T>(r)),
  delete: <T>(path: string, options?: MethodOptions) =>
    apiRequest(path, { ...options, method: "DELETE" }).then((r) => parseBody<T>(r)),
  blob: (path: string, options?: MethodOptions) =>
    apiRequest(path, { ...options, method: "GET" }).then((r) => r.blob()),
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
