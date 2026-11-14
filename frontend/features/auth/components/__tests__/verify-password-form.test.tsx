import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { VerifyPasswordForm } from "@/features/auth/components/verify-password-form"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({ router: { push: vi.fn(), replace: vi.fn() } }))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/api", () => ({
  authApi: { verifyPasswordResetCode: vi.fn(), requestPasswordReset: vi.fn() },
}))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

describe("VerifyPasswordForm", () => {
  it("stores the reset token and continues to the reset page", async () => {
    sessionStorage.setItem("passwordResetEmail", "jane@example.com")
    sessionStorage.setItem("resetFlowActive", "true")
    vi.mocked(authApi.verifyPasswordResetCode).mockResolvedValue("reset-token")
    const user = userEvent.setup()
    renderWithIntl(<VerifyPasswordForm />)

    expect(await screen.findByText("Password Reset Verification")).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText("Enter 6-digit code"), "654321")
    await user.click(screen.getByRole("button", { name: "Verify Code" }))

    expect(authApi.verifyPasswordResetCode).toHaveBeenCalledWith("jane@example.com", "654321")
    expect(sessionStorage.getItem("verifiedResetEmail")).toBe("jane@example.com")
    expect(sessionStorage.getItem("resetToken")).toBe("reset-token")
    expect(sessionStorage.getItem("passwordResetEmail")).toBeNull()
    expect(sessionStorage.getItem("resetFlowActive")).toBeNull()
    expect(mocks.router.push).toHaveBeenCalledWith("/reset-password")
  })

  it("resends the reset code to the stored email", async () => {
    sessionStorage.setItem("passwordResetEmail", "jane@example.com")
    vi.mocked(authApi.requestPasswordReset).mockResolvedValue("sent")
    const user = userEvent.setup()
    renderWithIntl(<VerifyPasswordForm />)

    await screen.findByText("jane@example.com")
    await user.click(screen.getByRole("button", { name: "Resend code" }))

    expect(authApi.requestPasswordReset).toHaveBeenCalledWith("jane@example.com")
  })
})
