import { describe, expect, it } from "vitest"
import { isPasswordChangeComplete, validatePasswordChange } from "@/features/settings/lib/validation"

const values = (currentPassword: string, newPassword: string, confirmPassword: string) => ({
  currentPassword,
  newPassword,
  confirmPassword,
})

describe("validatePasswordChange", () => {
  it("requires every field", () => {
    expect(validatePasswordChange(values("", "newpassword", "newpassword"))).toBe("missingFields")
    expect(validatePasswordChange(values("old", "", "newpassword"))).toBe("missingFields")
    expect(validatePasswordChange(values("old", "newpassword", ""))).toBe("missingFields")
  })

  it("requires the confirmation to match", () => {
    expect(validatePasswordChange(values("old", "newpassword1", "different1"))).toBe("passwordsDoNotMatch")
  })

  it("applies the same password rules as registration", () => {
    expect(validatePasswordChange(values("old", "short1", "short1"))).toBe("passwordTooShort")
    expect(validatePasswordChange(values("old", "12345678", "12345678"))).toBe("passwordMissingLetter")
    expect(validatePasswordChange(values("old", "abcdefgh", "abcdefgh"))).toBe("passwordMissingNumber")
    expect(validatePasswordChange(values("old", "abcd1234", "abcd1234"))).toBeNull()
  })
})

describe("isPasswordChangeComplete", () => {
  it("is true only when all fields are filled", () => {
    expect(isPasswordChangeComplete(values("a", "b", "c"))).toBe(true)
    expect(isPasswordChangeComplete(values("a", "b", ""))).toBe(false)
  })
})
