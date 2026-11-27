import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { LandingPage } from "@/features/landing/components/landing-page"

vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn() }) }))

describe("LandingPage", () => {
  it("says what CloudStore is and links to sign-up and sign-in", () => {
    renderWithIntl(<LandingPage />)

    expect(screen.getByRole("heading", { level: 1, name: "Your files, on your own server." })).toBeInTheDocument()
    for (const link of screen.getAllByRole("link", { name: "Create an account" })) {
      expect(link).toHaveAttribute("href", "/register")
    }
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")
    expect(screen.getByText("Sample files. Screens show the CloudStore web app.")).toBeInTheDocument()
    expect(screen.getByText(/^17 h 4\d m \d\d s left$/)).toBeInTheDocument()
    expect(screen.getByText("backend/…/file/service/AutoCleanupService.java")).toBeInTheDocument()
  })

  it("copies the install command", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    renderWithIntl(<LandingPage />)

    await user.click(screen.getByRole("button", { name: "Copy the command" }))
    expect(writeText).toHaveBeenCalledWith("docker compose up -d")
    expect(await screen.findByText("Copied")).toBeInTheDocument()
  })

  it("renders in Polish", () => {
    renderWithIntl(<LandingPage />, { locale: "pl" })
    expect(screen.getByRole("heading", { level: 1, name: "Twoje pliki na Twoim serwerze." })).toBeInTheDocument()
  })
})
