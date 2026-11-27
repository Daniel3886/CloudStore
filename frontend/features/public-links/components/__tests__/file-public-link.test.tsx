import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { publicLinksApi, type PublicFileAccessToken } from "@/features/public-links/api"
import { FilePublicLink } from "@/features/public-links/components/file-public-link"

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/features/public-links/api", () => ({
  publicLinksApi: {
    getActiveLinks: vi.fn(),
    generatePublicLink: vi.fn(),
    revokePublicLink: vi.fn(),
    getPublicFileUrl: (token: string, preview = false) => `http://api.test/p/${token}${preview ? "?preview=true" : ""}`,
  },
}))

const now = new Date("2026-11-25T12:00:00Z")
const api = vi.mocked(publicLinksApi)

function link(fileId: number, expiresAt: string): PublicFileAccessToken {
  return {
    id: fileId,
    token: `tok-${fileId}`,
    file: { id: fileId, displayName: "a.pdf", s3Key: "k", size: 100 },
    expiresAt,
    active: true,
  }
}

describe("FilePublicLink", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now, toFake: ["Date"] })
    api.revokePublicLink.mockResolvedValue()
    api.generatePublicLink.mockResolvedValue({ downloadLink: "http://api.test/p/new" })
  })
  afterEach(() => vi.useRealTimers())

  it("shows the time left on this file's link and lets you copy and turn it off", async () => {
    api.getActiveLinks.mockResolvedValue([link(2, "2026-11-26T00:00:00Z"), link(7, "2026-11-25T17:30:00Z")])
    const user = userEvent.setup()
    renderWithIntl(<FilePublicLink fileId={7} enabled />)

    expect(await screen.findByText("5h 30m remaining")).toBeInTheDocument()
    expect(screen.getByText("Public link is on")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy download link" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy preview link" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Turn off" }))
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Revoke Link" }))

    expect(api.revokePublicLink).toHaveBeenCalledWith("tok-7")
    expect(await screen.findByRole("button", { name: "Create 24-hour link" })).toBeInTheDocument()
  })

  it("creates a link when the file has none, then shows it", async () => {
    api.getActiveLinks.mockResolvedValueOnce([]).mockResolvedValueOnce([link(7, "2026-11-26T12:00:00Z")])
    const user = userEvent.setup()
    renderWithIntl(<FilePublicLink fileId={7} enabled />)

    expect(await screen.findByText(/can download this file for 24 hours/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Create 24-hour link" }))

    expect(api.generatePublicLink).toHaveBeenCalledWith(7)
    await waitFor(() => expect(screen.getByText("24h 0m remaining")).toBeInTheDocument())
  })

  it("does nothing while the dialog is closed", () => {
    renderWithIntl(<FilePublicLink fileId={7} enabled={false} />)
    expect(api.getActiveLinks).not.toHaveBeenCalled()
  })

  it("explains when the file has no usable id", () => {
    renderWithIntl(<FilePublicLink fileId={null} enabled />)
    expect(screen.getByText(/can't have a public link right now/)).toBeInTheDocument()
  })
})
