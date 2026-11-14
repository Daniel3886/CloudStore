import { describe, expect, it } from "vitest"
import { authFlowStorage } from "@/features/auth/lib/flow-storage"

describe("authFlowStorage", () => {
  it("stores the pending verification email under the shared key", () => {
    authFlowStorage.setPendingVerificationEmail("user@example.com")
    expect(sessionStorage.getItem("pendingVerificationEmail")).toBe("user@example.com")

    authFlowStorage.clearPendingVerificationEmail()
    expect(authFlowStorage.getPendingVerificationEmail()).toBeNull()
  })

  it("moves the password reset flow from email to verified session", () => {
    authFlowStorage.startPasswordReset("user@example.com")
    expect(authFlowStorage.getPasswordResetEmail()).toBe("user@example.com")
    expect(sessionStorage.getItem("resetFlowActive")).toBe("true")
    expect(authFlowStorage.getResetSession()).toBeNull()

    authFlowStorage.completeResetVerification({ email: "user@example.com", resetToken: "token-1" })
    expect(sessionStorage.getItem("passwordResetEmail")).toBeNull()
    expect(sessionStorage.getItem("resetFlowActive")).toBeNull()
    expect(authFlowStorage.getResetSession()).toEqual({ email: "user@example.com", resetToken: "token-1" })

    authFlowStorage.clearResetSession()
    expect(authFlowStorage.getResetSession()).toBeNull()
  })
})
