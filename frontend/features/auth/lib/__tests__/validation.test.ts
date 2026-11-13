import { describe, expect, it } from "vitest"
import {
  hasErrors,
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequiredPassword,
  validateUsername,
  validateVerificationCode,
} from "@/features/auth/lib/validation"

describe("validateEmail", () => {
  it("requires a well-formed address", () => {
    expect(validateEmail("")).toBe("emailRequired")
    expect(validateEmail("user@")).toBe("emailInvalid")
    expect(validateEmail("user @example.com")).toBe("emailInvalid")
    expect(validateEmail("user@example.com")).toBeUndefined()
  })
})

describe("validateUsername", () => {
  it("enforces the length limits", () => {
    expect(validateUsername("")).toBe("usernameRequired")
    expect(validateUsername("ab")).toBe("usernameTooShort")
    expect(validateUsername("a".repeat(21))).toBe("usernameTooLong")
    expect(validateUsername("abc")).toBeUndefined()
    expect(validateUsername("a".repeat(20))).toBeUndefined()
  })
})

describe("validateRequiredPassword", () => {
  it("only checks presence", () => {
    expect(validateRequiredPassword("")).toBe("passwordRequired")
    expect(validateRequiredPassword("x")).toBeUndefined()
  })
})

describe("validateNewPassword", () => {
  it("checks length, digits and letters in order", () => {
    expect(validateNewPassword("")).toBe("passwordRequired")
    expect(validateNewPassword("abc123")).toBe("passwordTooShort")
    expect(validateNewPassword(`a1${"x".repeat(127)}`)).toBe("passwordTooLong")
    expect(validateNewPassword("abcdefgh")).toBe("passwordMissingNumber")
    expect(validateNewPassword("12345678")).toBe("passwordMissingLetter")
    expect(validateNewPassword("abcdefg1")).toBeUndefined()
  })
})

describe("validatePasswordConfirmation", () => {
  it("requires a matching confirmation", () => {
    expect(validatePasswordConfirmation("secret12", "")).toBe("confirmPasswordRequired")
    expect(validatePasswordConfirmation("secret12", "secret13")).toBe("passwordsDoNotMatch")
    expect(validatePasswordConfirmation("secret12", "secret12")).toBeUndefined()
  })
})

describe("validateVerificationCode", () => {
  it("requires exactly six characters", () => {
    expect(validateVerificationCode("")).toBe("codeRequired")
    expect(validateVerificationCode("12345")).toBe("codeInvalidLength")
    expect(validateVerificationCode("123456")).toBeUndefined()
  })
})

describe("hasErrors", () => {
  it("ignores cleared fields", () => {
    expect(hasErrors({})).toBe(false)
    expect(hasErrors({ email: undefined })).toBe(false)
    expect(hasErrors({ email: "emailRequired" })).toBe(true)
  })
})
