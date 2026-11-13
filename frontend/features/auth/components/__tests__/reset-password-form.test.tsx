import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { ApiError } from "@/lib/api/client"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({ router: { push: vi.fn(), replace: vi.fn() } }))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/api", () => ({ authApi: { resetPassword: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

function startVerifiedSession() {
  sessionStorage.setItem("verifiedResetEmail", "jane@example.com")
  sessionStorage.setItem("resetToken", "reset-token")
}

async function submitPasswords(password: string, confirmation: string) {
  const user = userEvent.setup()
  await user.type(await screen.findByPlaceholderText("New password (8+ chars, include letters & numbers)"), password)
  await user.type(screen.getByPlaceholderText("Confirm new password"), confirmation)
  await user.click(screen.getByRole("button", { name: "Reset Password" }))
}

describe("ResetPasswordForm", () => {
  it("shows the invalid session state without a verified reset session", async () => {
    renderWithIntl(<ResetPasswordForm />)

    expect(await screen.findByText("Invalid Session")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Start password reset" })).toHaveAttribute("href", "/forgot-password")
    expect(screen.getByRole("link", { name: "Back to login" })).toHaveAttribute("href", "/login")
  })

  it("requires matching passwords", async () => {
    startVerifiedSession()
    renderWithIntl(<ResetPasswordForm />)

    await submitPasswords("secret123", "secret124")

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    expect(authApi.resetPassword).not.toHaveBeenCalled()
  })

  it("submits the email, reset token and new password", async () => {
    startVerifiedSession()
    vi.mocked(authApi.resetPassword).mockResolvedValue("ok")
    renderWithIntl(<ResetPasswordForm />)

    expect(await screen.findByText("Resetting password for: jane@example.com")).toBeInTheDocument()
    await submitPasswords("secret123", "secret123")

    expect(authApi.resetPassword).toHaveBeenCalledWith({
      email: "jane@example.com",
      resetToken: "reset-token",
      newPassword: "secret123",
    })
    expect(await screen.findByText("Password Reset Successful!")).toBeInTheDocument()
    expect(sessionStorage.getItem("verifiedResetEmail")).toBeNull()
    expect(sessionStorage.getItem("resetToken")).toBeNull()

    await userEvent.setup().click(screen.getByRole("button", { name: "Go to Login" }))
    expect(mocks.router.push).toHaveBeenCalledWith("/login")
  })

  it("shows the backend error and keeps the session", async () => {
    startVerifiedSession()
    vi.mocked(authApi.resetPassword).mockRejectedValue(new ApiError(400, "Reset token expired"))
    renderWithIntl(<ResetPasswordForm />)

    await submitPasswords("secret123", "secret123")

    expect(await screen.findByText("Reset token expired")).toBeInTheDocument()
    expect(sessionStorage.getItem("resetToken")).toBe("reset-token")
  })
})
