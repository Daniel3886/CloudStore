import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError, api, buildUrl, onSessionExpired } from "@/lib/api/client"
import { getAccessToken, getRefreshToken, setTokens } from "@/lib/session"

type Handler = (url: URL, init: RequestInit) => Response | Promise<Response>

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

function mockFetch(handler: Handler) {
  const calls: { url: URL; init: RequestInit }[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input))
    calls.push({ url, init })
    return handler(url, init)
  })
  vi.stubGlobal("fetch", fetchMock)
  return calls
}

const authHeader = (init: RequestInit) => new Headers(init.headers).get("Authorization")

describe("buildUrl", () => {
  it("joins the base URL and path and drops empty query values", () => {
    expect(buildUrl("/file/rename", { s3Key: "a b", newDisplayName: "x/y", skip: undefined, none: null })).toBe(
      "http://api.test/file/rename?s3Key=a+b&newDisplayName=x%2Fy",
    )
  })
})

describe("api client", () => {
  beforeEach(() => setTokens("access-1", "refresh-1"))
  afterEach(() => vi.unstubAllGlobals())

  it("sends the access token and parses JSON responses", async () => {
    const calls = mockFetch(() => json([{ id: 1 }]))

    await expect(api.get("/file/list")).resolves.toEqual([{ id: 1 }])
    expect(authHeader(calls[0].init)).toBe("Bearer access-1")
  })

  it("returns plain text bodies as strings", async () => {
    mockFetch(() => new Response("File shared successfully", { status: 200 }))

    await expect(api.post("/share", { json: { fileId: 1 } })).resolves.toBe("File shared successfully")
  })

  it("does not send a token for public requests", async () => {
    const calls = mockFetch(() => json({ accessToken: "a", refreshToken: "r" }))

    await api.post("/auth/login", { auth: false, json: {} })
    expect(authHeader(calls[0].init)).toBeNull()
  })

  it("refreshes once on 401 and retries with the new token", async () => {
    const calls = mockFetch((url, init) => {
      if (url.pathname === "/auth/refresh-token") return json({ accessToken: "access-2", refreshToken: "refresh-2" })
      return authHeader(init) === "Bearer access-2" ? json(["ok"]) : new Response("", { status: 401 })
    })

    await expect(api.get("/share/received")).resolves.toEqual(["ok"])
    expect(calls.map((c) => c.url.pathname)).toEqual(["/share/received", "/auth/refresh-token", "/share/received"])
    expect(getAccessToken()).toBe("access-2")
    expect(getRefreshToken()).toBe("refresh-2")
  })

  it("shares a single refresh between parallel requests", async () => {
    const calls = mockFetch((url, init) => {
      if (url.pathname === "/auth/refresh-token") return json({ accessToken: "access-2" })
      return authHeader(init) === "Bearer access-2" ? json([]) : new Response("", { status: 401 })
    })

    await Promise.all([api.get("/a"), api.get("/b"), api.get("/c")])
    expect(calls.filter((c) => c.url.pathname === "/auth/refresh-token")).toHaveLength(1)
  })

  it("clears the session and notifies listeners when refresh fails", async () => {
    mockFetch((url) =>
      url.pathname === "/auth/refresh-token" ? new Response("", { status: 401 }) : new Response("", { status: 401 }),
    )
    const listener = vi.fn()
    const unsubscribe = onSessionExpired(listener)

    await expect(api.get("/activity/all")).rejects.toMatchObject({ status: 401 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    unsubscribe()
  })

  it("uses the backend message from JSON error bodies", async () => {
    mockFetch(() => json({ status: 400, message: "Email already in use." }, 400))

    const error = await api.post("/auth/register", { auth: false }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message: "Email already in use." })
  })

  it("uses plain text error bodies as the message", async () => {
    mockFetch(() => new Response("Invalid password.", { status: 401 }))

    await expect(api.post("/auth/login", { auth: false })).rejects.toMatchObject({ message: "Invalid password." })
  })

  it("falls back to the provided message for empty error bodies", async () => {
    mockFetch(() => new Response("", { status: 500 }))

    await expect(api.get("/x", { errorMessage: "Failed to load" })).rejects.toMatchObject({ message: "Failed to load" })
  })

  it("turns network failures into a status 0 ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed")
      }),
    )

    await expect(api.get("/x")).rejects.toMatchObject({ status: 0 })
  })
})
