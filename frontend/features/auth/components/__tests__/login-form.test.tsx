import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { LoginForm } from "@/features/auth/components/login-form"
import { toast } from "@/hooks/use-toast"
import { ApiError } from "@/lib/api/client"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({ router: { push: vi.fn(), replace: vi.fn() }, login: vi.fn() }))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/components/auth-provider", () => ({ useAuth: () => ({ login: mocks.login }) }))
vi.mock("@/features/auth/api", () => ({ authApi: { login: vi.fn() } }))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByPlaceholderText("Email address"), email)
  if (password) await user.type(screen.getByPlaceholderText("Password"), password)
  await user.click(screen.getByRole("button", { name: "Sign in" }))
  return user
}

describe("LoginForm", () => {
  beforeEach(() => {
    mocks.login.mockResolvedValue(undefined)
  })

  it("shows translated validation errors and does not call the API", async () => {
    renderWithIntl(<LoginForm />)

    await fillAndSubmit("", "")

    expect(screen.getByText("Email is required")).toBeInTheDocument()
    expect(screen.getByText("Password is required")).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it("rejects malformed email addresses and clears the error on edit", async () => {
    renderWithIntl(<LoginForm />)

    const user = await fillAndSubmit("not-an-email", "secret")
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText("Email address"), "@example.com")
    expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument()
  })

  it("logs in with the returned tokens and navigates to files", async () => {
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: "access", refreshToken: "refresh" })
    renderWithIntl(<LoginForm />)

    await fillAndSubmit("user@example.com", "secret")

    expect(authApi.login).toHaveBeenCalledWith("user@example.com", "secret")
    expect(mocks.login).toHaveBeenCalledWith("access", "refresh")
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Welcome back!" }))
    expect(mocks.router.push).toHaveBeenCalledWith("/files")
  })

  it("shows the backend error message", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, "Invalid credentials"))
    renderWithIntl(<LoginForm />)

    await fillAndSubmit("user@example.com", "wrong")

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument()
    expect(mocks.login).not.toHaveBeenCalled()
    expect(mocks.router.push).not.toHaveBeenCalled()
  })

  it("falls back to a translated message for unknown errors", async () => {
    vi.mocked(authApi.login).mockRejectedValue("network down")
    renderWithIntl(<LoginForm />)

    await fillAndSubmit("user@example.com", "secret")

    expect(await screen.findByText("Unable to sign in. Please try again.")).toBeInTheDocument()
  })

  it("rejects responses without tokens", async () => {
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: "", refreshToken: "" })
    renderWithIntl(<LoginForm />)

    await fillAndSubmit("user@example.com", "secret")

    expect(await screen.findByText("Invalid response format from server")).toBeInTheDocument()
    expect(mocks.login).not.toHaveBeenCalled()
  })
})
