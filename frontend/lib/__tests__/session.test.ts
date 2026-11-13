import { describe, expect, it } from "vitest"
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUserEmail,
  hasStoredSession,
  setTokens,
  setUserEmail,
} from "@/lib/session"

describe("session storage", () => {
  it("stores and clears tokens and the user email", () => {
    expect(hasStoredSession()).toBe(false)

    setTokens("access", "refresh")
    setUserEmail("me@example.com")
    expect(getAccessToken()).toBe("access")
    expect(getRefreshToken()).toBe("refresh")
    expect(hasStoredSession()).toBe(true)

    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(getUserEmail()).toBeNull()
  })

  it("keeps the existing refresh token when only an access token is given", () => {
    setTokens("access-1", "refresh-1")
    setTokens("access-2")
    expect(getRefreshToken()).toBe("refresh-1")
  })
})
