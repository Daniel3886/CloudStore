import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { SharedTabs } from "@/features/sharing/components/shared-tabs"

vi.mock("@/features/sharing/components/shared-files-browser", () => ({
  SharedFilesBrowser: () => <p>received list</p>,
}))
vi.mock("@/features/public-links/components/public-links-panel", () => ({ PublicLinksPanel: () => <p>links panel</p> }))

describe("SharedTabs", () => {
  afterEach(() => window.history.replaceState(null, "", "/"))

  it("starts on files shared with you and switches to public links", async () => {
    const user = userEvent.setup()
    renderWithIntl(<SharedTabs />)

    expect(screen.getByRole("heading", { name: "Shared" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Shared with me" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("received list")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: "Public links" }))
    expect(screen.getByText("links panel")).toBeInTheDocument()
    expect(window.location.hash).toBe("#public-links")
  })

  it("opens the public links tab from the #public-links address", () => {
    window.history.replaceState(null, "", "/shared#public-links")
    renderWithIntl(<SharedTabs />)
    expect(screen.getByRole("tab", { name: "Public links" })).toHaveAttribute("aria-selected", "true")
  })
})
