import { describe, expect, it } from "vitest"
import { extractErrorMessage, getApiErrorKey } from "@/lib/api/errors"

describe("extractErrorMessage", () => {
  it("prefers message, then error, from JSON bodies", () => {
    expect(extractErrorMessage('{"message":"Nope","error":"Bad Request"}', "fallback")).toBe("Nope")
    expect(extractErrorMessage('{"error":"Unauthorized"}', "fallback")).toBe("Unauthorized")
  })

  it("returns plain text as-is and falls back on empty input", () => {
    expect(extractErrorMessage("Invalid password.", "fallback")).toBe("Invalid password.")
    expect(extractErrorMessage("   ", "fallback")).toBe("fallback")
    expect(extractErrorMessage("{}", "fallback")).toBe("fallback")
  })
})

describe("getApiErrorKey", () => {
  it("maps known backend messages, including ones with dynamic suffixes", () => {
    expect(getApiErrorKey(400, "Email already in use.")).toBe("emailInUse")
    expect(getApiErrorKey(401, "Invalid password.")).toBe("invalidCredentials")
    expect(getApiErrorKey(400, "Please wait 42 seconds before requesting a new code.")).toBe("rateLimited")
    expect(getApiErrorKey(400, "File not found: users/1/a.txt")).toBe("fileNotFound")
  })

  it("maps network failures and statuses without a known message", () => {
    expect(getApiErrorKey(0, "anything")).toBe("network")
    expect(getApiErrorKey(413, "<html>Payload Too Large</html>")).toBe("fileTooLarge")
    expect(getApiErrorKey(429, "")).toBe("rateLimited")
  })

  it("returns nothing for unknown messages so callers use their own fallback", () => {
    expect(getApiErrorKey(500, "Rename failed: S3 timeout")).toBeUndefined()
    expect(getApiErrorKey(502, "<html>Bad Gateway</html>")).toBeUndefined()
  })
})
