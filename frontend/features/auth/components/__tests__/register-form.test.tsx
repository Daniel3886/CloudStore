import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { RegisterForm } from "@/features/auth/components/register-form"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({ router: { push: vi.fn(), replace: vi.fn() } }))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/api", () => ({ authApi: { register: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

async function fillForm({ username = "", email = "", password = "" }) {
  const user = userEvent.setup()
  if (username) await user.type(screen.getByPlaceholderText("Username (3-20 characters)"), username)
  if (email) await user.type(screen.getByPlaceholderText("Email address"), email)
  if (password) {
    await user.type(screen.getByPlaceholderText("Password (8+ chars, include letters & numbers)"), password)
  }
  await user.click(screen.getByRole("button", { name: "Create account" }))
}

describe("RegisterForm", () => {
  it("requires every field", async () => {
    renderWithIntl(<RegisterForm />)

    await fillForm({})

    expect(screen.getByText("Username is required")).toBeInTheDocument()
    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it("validates username length and password strength", async () => {
    renderWithIntl(<RegisterForm />)

    await fillForm({ username: "ab", email: "user@example.com", password: "abcdefgh" })

    expect(screen.getByText("Username must be at least 3 characters long")).toBeInTheDocument()
    expect(screen.getByText("Password must contain at least one number")).toBeInTheDocument()
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it("registers, remembers the email for verification and navigates", async () => {
    vi.mocked(authApi.register).mockResolvedValue("ok")
    renderWithIntl(<RegisterForm />)

    await fillForm({ username: "jane", email: "jane@example.com", password: "secret123" })

    expect(authApi.register).toHaveBeenCalledWith({
      username: "jane",
      email: "jane@example.com",
      password: "secret123",
    })
    expect(sessionStorage.getItem("pendingVerificationEmail")).toBe("jane@example.com")
    expect(mocks.router.push).toHaveBeenCalledWith("/verify")
  })

  it("shows a translated fallback when registration fails without a message", async () => {
    vi.mocked(authApi.register).mockRejectedValue(null)
    renderWithIntl(<RegisterForm />)

    await fillForm({ username: "jane", email: "jane@example.com", password: "secret123" })

    expect(
      await screen.findByText("Unable to create account. Please check your connection and try again."),
    ).toBeInTheDocument()
    expect(mocks.router.push).not.toHaveBeenCalled()
  })
})
