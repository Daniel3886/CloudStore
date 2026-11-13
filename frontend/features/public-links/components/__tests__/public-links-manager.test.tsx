import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { toast } from "@/hooks/use-toast"
import { publicLinksApi, type PublicFileAccessToken } from "@/features/public-links/api"
import { PublicLinksManager } from "@/features/public-links/components/public-links-manager"

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/features/public-links/api", () => ({
  publicLinksApi: {
    getActiveLinks: vi.fn(),
    revokePublicLink: vi.fn(),
    getPublicFileUrl: (token: string, preview = false) =>
      `http://api.test/share/public/access/${token}${preview ? "?preview=true" : ""}`,
  },
}))

const now = new Date("2026-05-01T12:00:00Z")

function link(id: number, name: string, size: number, expiresAt: string): PublicFileAccessToken {
  return { id, token: `tok-${id}`, file: { id, displayName: name, s3Key: `k${id}`, size }, expiresAt, active: true }
}

const small = link(1, "notes.txt", 2048, "2026-05-01T14:30:00Z")
const large = link(2, "video.mp4", 50 * 1024 * 1024, "2026-05-01T12:20:00Z")
const expired = link(3, "old.zip", 10, "2026-05-01T11:00:00Z")

function row(name: string) {
  const element = screen.getByText(name).closest(".rounded-lg.border")
  if (!(element instanceof HTMLElement)) throw new Error(`row for ${name} not found`)
  return within(element)
}

describe("PublicLinksManager", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now, toFake: ["Date"] })
    vi.mocked(publicLinksApi.getActiveLinks).mockResolvedValue([small, large, expired])
    vi.mocked(publicLinksApi.revokePublicLink).mockResolvedValue()
  })

  afterEach(() => vi.useRealTimers())

  it("lists links with size, expiry and the available actions", async () => {
    renderWithIntl(<PublicLinksManager open onOpenChange={vi.fn()} />)

    expect(await screen.findByText("notes.txt")).toBeInTheDocument()
    expect(screen.getByText("3 active links")).toBeInTheDocument()

    const smallRow = row("notes.txt")
    expect(smallRow.getByText("2 kB")).toBeInTheDocument()
    expect(smallRow.getByText("2h 30m remaining")).toBeInTheDocument()
    expect(smallRow.getByRole("button", { name: "Copy preview link" })).toBeInTheDocument()
    expect(smallRow.getByRole("button", { name: "Copy download link" })).toBeInTheDocument()

    const largeRow = row("video.mp4")
    expect(largeRow.getByText("20m remaining")).toBeInTheDocument()
    expect(largeRow.queryByRole("button", { name: "Copy preview link" })).not.toBeInTheDocument()
    expect(largeRow.getByRole("button", { name: "Copy download link" })).toBeInTheDocument()

    const expiredRow = row("old.zip")
    expect(expiredRow.getByText("Expired")).toBeInTheDocument()
    expect(expiredRow.getByText("10 bytes")).toBeInTheDocument()
    expect(expiredRow.queryByRole("button", { name: "Copy download link" })).not.toBeInTheDocument()
    expect(expiredRow.getByRole("button", { name: "Revoke link" })).toBeInTheDocument()
  })

  it("copies a link to the clipboard", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    renderWithIntl(<PublicLinksManager open onOpenChange={vi.fn()} />)

    await screen.findByText("notes.txt")
    await user.click(row("notes.txt").getByRole("button", { name: "Copy download link" }))

    expect(writeText).toHaveBeenCalledWith("http://api.test/share/public/access/tok-1")
    expect(toast).toHaveBeenCalledWith({ title: "Link copied", description: "Download link copied to clipboard" })
  })

  it("revokes a link after confirmation", async () => {
    const user = userEvent.setup()
    renderWithIntl(<PublicLinksManager open onOpenChange={vi.fn()} />)

    await screen.findByText("notes.txt")
    await user.click(row("notes.txt").getByRole("button", { name: "Revoke link" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByText(/revoke the public link for "notes.txt"/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Revoke Link" }))

    expect(publicLinksApi.revokePublicLink).toHaveBeenCalledWith("tok-1")
    await waitFor(() => expect(screen.queryByText("notes.txt")).not.toBeInTheDocument())
    expect(screen.getByText("2 active links")).toBeInTheDocument()
    expect(toast).toHaveBeenCalledWith({
      title: "Link revoked",
      description: 'Public access to "notes.txt" has been revoked',
    })
  })

  it("does not revoke when the confirmation is cancelled", async () => {
    const user = userEvent.setup()
    renderWithIntl(<PublicLinksManager open onOpenChange={vi.fn()} />)

    await screen.findByText("notes.txt")
    await user.click(row("notes.txt").getByRole("button", { name: "Revoke link" }))
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancel" }))

    expect(publicLinksApi.revokePublicLink).not.toHaveBeenCalled()
    expect(screen.getByText("notes.txt")).toBeInTheDocument()
  })

  it("shows the empty state", async () => {
    vi.mocked(publicLinksApi.getActiveLinks).mockResolvedValue([])
    renderWithIntl(<PublicLinksManager open onOpenChange={vi.fn()} />)

    expect(await screen.findByText("No active public links")).toBeInTheDocument()
    expect(screen.getByText("0 active links")).toBeInTheDocument()
  })

  it("does not fetch while closed", () => {
    renderWithIntl(<PublicLinksManager open={false} onOpenChange={vi.fn()} />)

    expect(publicLinksApi.getActiveLinks).not.toHaveBeenCalled()
  })
})
