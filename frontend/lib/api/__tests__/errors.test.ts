import { describe, expect, it } from "vitest"
import { extractErrorMessage } from "@/lib/api/errors"

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
