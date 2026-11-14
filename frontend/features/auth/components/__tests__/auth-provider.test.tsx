import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authApi } from "@/features/auth/api"
import { AuthProvider, useAuth } from "@/features/auth/components/auth-provider"
import { ProtectedRoute } from "@/features/auth/components/protected-route"
import { ApiError, onSessionExpired } from "@/lib/api/client"
import { getAccessToken, setTokens } from "@/lib/session"
import { renderWithIntl } from "@/test/render"

const mocks = vi.hoisted(() => ({
  router: { push: vi.fn(), replace: vi.fn() },
  expire: null as null | (() => void),
}))

vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/features/auth/api", () => ({ authApi: { getProfile: vi.fn() } }))
vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>()
  return {
    ...actual,
    onSessionExpired: vi.fn((listener: () => void) => {
      mocks.expire = listener
      return () => {
        mocks.expire = null
      }
    }),
  }
})

const profile = { email: "jane@example.com", username: "jane", verified: true }

function Status() {
  const { user, isAuthenticated } = useAuth()
  return <p>{isAuthenticated ? `signed in as ${user?.email}` : "signed out"}</p>
}

function renderApp() {
  return renderWithIntl(
    <AuthProvider>
      <Status />
      <ProtectedRoute>
        <p>private content</p>
      </ProtectedRoute>
    </AuthProvider>,
  )
}

describe("AuthProvider and ProtectedRoute", () => {
  beforeEach(() => {
    vi.mocked(authApi.getProfile).mockReset()
  })

  it("redirects to login without a stored session and skips the profile request", async () => {
    renderApp()

    expect(await screen.findByText("signed out")).toBeInTheDocument()
    expect(mocks.router.push).toHaveBeenCalledWith("/login")
    expect(authApi.getProfile).not.toHaveBeenCalled()
    expect(screen.queryByText("private content")).not.toBeInTheDocument()
  })

  it("loads the profile and renders protected content", async () => {
    setTokens("access", "refresh")
    vi.mocked(authApi.getProfile).mockResolvedValue(profile)
    renderApp()

    expect(await screen.findByText("private content")).toBeInTheDocument()
    expect(screen.getByText("signed in as jane@example.com")).toBeInTheDocument()
    expect(mocks.router.push).not.toHaveBeenCalled()
  })

  it("redirects to login when the backend rejects the session", async () => {
    setTokens("access", "refresh")
    vi.mocked(authApi.getProfile).mockRejectedValue(new ApiError(401, "Unauthorized"))
    renderApp()

    expect(await screen.findByText("signed out")).toBeInTheDocument()
    expect(mocks.router.push).toHaveBeenCalledWith("/login")
  })

  it("keeps the session and offers a retry when the profile cannot be loaded", async () => {
    setTokens("access", "refresh")
    vi.mocked(authApi.getProfile).mockRejectedValueOnce(new ApiError(0, "offline")).mockResolvedValueOnce(profile)
    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByRole("heading", { name: "Can't reach CloudStore" })).toBeInTheDocument()
    expect(mocks.router.push).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe("access")

    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(await screen.findByText("private content")).toBeInTheDocument()
  })

  it("signs the user out when the session expires", async () => {
    setTokens("access", "refresh")
    vi.mocked(authApi.getProfile).mockResolvedValue(profile)
    renderApp()
    await screen.findByText("private content")
    expect(onSessionExpired).toHaveBeenCalled()

    act(() => mocks.expire?.())

    expect(screen.getByText("signed out")).toBeInTheDocument()
    expect(screen.queryByText("private content")).not.toBeInTheDocument()
    expect(mocks.router.push).toHaveBeenCalledWith("/login")
  })
})
