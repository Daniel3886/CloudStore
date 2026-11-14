import { API_BASE_URL } from "@/lib/config"
import { extractErrorMessage, type ApiErrorBody } from "@/lib/api/errors"
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/session"

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
  signal?: AbortSignal
}

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again."

type SessionExpiredListener = () => void

export type RefreshResult = "refreshed" | "rejected" | "unavailable"

const sessionExpiredListeners = new Set<SessionExpiredListener>()
let refreshInFlight: Promise<RefreshResult> | null = null

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

export function refreshSession(): Promise<RefreshResult> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

function isRejectedRefreshStatus(status: number): boolean {
  return status === 400 || status === 401 || status === 403
}

async function performRefresh(): Promise<RefreshResult> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return "rejected"

  let response: Response
  try {
    response = await fetch(buildUrl("/auth/refresh-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    return "unavailable"
  }

  if (isRejectedRefreshStatus(response.status)) return "rejected"
  if (!response.ok) return "unavailable"

  try {
    const data = (await response.json()) as { accessToken?: string; refreshToken?: string }
    if (!data.accessToken) return "rejected"
    setTokens(data.accessToken, data.refreshToken ?? refreshToken)
    return "refreshed"
  } catch {
    return "unavailable"
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
    throw new ApiError(0, NETWORK_ERROR_MESSAGE)
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const text = await response.text().catch(() => "")
  let body: ApiErrorBody | null = null
  try {
    body = text ? (JSON.parse(text) as ApiErrorBody) : null
  } catch {
    body = null
  }
  const message = extractErrorMessage(text, `Request failed (${response.status})`)
  return new ApiError(response.status, message, body)
}

export async function apiRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  const authenticated = options.auth ?? true
  let response = await send(path, options, authenticated ? getAccessToken() : null)

  if (authenticated && response.status === 401) {
    const result = await refreshSession()
    if (result === "refreshed") {
      response = await send(path, options, getAccessToken())
    } else if (result === "rejected") {
      expireSession()
    } else {
      throw new ApiError(0, NETWORK_ERROR_MESSAGE)
    }
  }

  if (!response.ok) {
    throw await toApiError(response)
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
