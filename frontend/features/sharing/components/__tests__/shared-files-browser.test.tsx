import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { toast } from "@/hooks/use-toast"
import { filesApi } from "@/features/files/api"
import { sharingApi, type SharedFileDto } from "@/features/sharing/api"
import { SharedFilesBrowser } from "@/features/sharing/components/shared-files-browser"

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/lib/download", () => ({ saveBlob: vi.fn() }))
vi.mock("@/features/files/api", () => ({ filesApi: { download: vi.fn() } }))
vi.mock("@/features/sharing/api", () => ({
  sharingApi: { getSharedFiles: vi.fn(), acceptShare: vi.fn(), declineShare: vi.fn() },
}))

function share(overrides: Partial<SharedFileDto>): SharedFileDto {
  return {
    permissionId: 1,
    fileId: 10,
    displayName: "report.pdf",
    sharedBy: "bob@example.com",
    s3Key: "key-1",
    sharedAt: "2026-03-01T10:00:00Z",
    sharedWithEmail: "me@example.com",
    shareStatus: "PENDING",
    ...overrides,
  }
}

const pending = share({ permissionId: 1, displayName: "report.pdf", message: "Please review" })
const accepted = share({
  permissionId: 2,
  fileId: 11,
  displayName: "photos/beach.png",
  s3Key: "key-2",
  shareStatus: "ACCEPTED",
  shareStatusChangedAt: "2026-03-02T10:00:00Z",
})

function card(name: string) {
  const title = screen.getByText(name)
  const element = title.closest(".rounded-lg.border")
  if (!(element instanceof HTMLElement)) throw new Error(`card for ${name} not found`)
  return within(element)
}

describe("SharedFilesBrowser", () => {
  beforeEach(() => {
    vi.mocked(sharingApi.getSharedFiles).mockResolvedValue([pending, accepted])
    vi.mocked(sharingApi.acceptShare).mockResolvedValue()
    vi.mocked(sharingApi.declineShare).mockResolvedValue()
  })

  it("shows pending shares with accept/decline and accepted shares with download", async () => {
    renderWithIntl(<SharedFilesBrowser />)

    expect(await screen.findByText("Shared with me")).toBeInTheDocument()
    expect(screen.getByText("2 files")).toBeInTheDocument()

    const pendingCard = card("report.pdf")
    expect(pendingCard.getByText("Pending")).toBeInTheDocument()
    expect(pendingCard.getByText("Shared by bob@example.com")).toBeInTheDocument()
    expect(pendingCard.getByText("Shared Mar 1, 2026")).toBeInTheDocument()
    expect(pendingCard.getByText("Please review")).toBeInTheDocument()
    expect(pendingCard.getByRole("button", { name: 'Accept "report.pdf"' })).toBeInTheDocument()
    expect(pendingCard.queryByRole("button", { name: /Download/ })).not.toBeInTheDocument()

    const acceptedCard = card("photos/beach.png")
    expect(acceptedCard.getByText("Accepted")).toBeInTheDocument()
    expect(acceptedCard.getByText("Accepted Mar 2, 2026")).toBeInTheDocument()
    expect(acceptedCard.getByRole("button", { name: 'Download "photos/beach.png"' })).toBeInTheDocument()
    expect(acceptedCard.queryByRole("button", { name: /Accept/ })).not.toBeInTheDocument()
  })

  it("accepts a pending share and updates its status", async () => {
    const user = userEvent.setup()
    renderWithIntl(<SharedFilesBrowser />)

    await user.click(await screen.findByRole("button", { name: 'Accept "report.pdf"' }))

    expect(sharingApi.acceptShare).toHaveBeenCalledWith(1)
    const pendingCard = card("report.pdf")
    await waitFor(() => expect(pendingCard.getByText("Accepted")).toBeInTheDocument())
    expect(pendingCard.getByRole("button", { name: 'Download "report.pdf"' })).toBeInTheDocument()
    expect(toast).toHaveBeenCalledWith({ title: "Share accepted", description: 'You now have access to "report.pdf"' })
    expect(sharingApi.getSharedFiles).toHaveBeenCalledTimes(1)
  })

  it("declines a pending share and removes it from the list", async () => {
    const user = userEvent.setup()
    renderWithIntl(<SharedFilesBrowser />)

    await user.click(await screen.findByRole("button", { name: 'Decline "report.pdf"' }))

    expect(sharingApi.declineShare).toHaveBeenCalledWith(1)
    await waitFor(() => expect(screen.queryByText("report.pdf")).not.toBeInTheDocument())
  })

  it("keeps the share pending and shows the backend error when accepting fails", async () => {
    vi.mocked(sharingApi.acceptShare).mockRejectedValue(new Error("Share no longer exists"))
    const user = userEvent.setup()
    renderWithIntl(<SharedFilesBrowser />)

    await user.click(await screen.findByRole("button", { name: 'Accept "report.pdf"' }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to accept share",
        description: "Share no longer exists",
      }),
    )
    expect(card("report.pdf").getByText("Pending")).toBeInTheDocument()
  })

  it("downloads an accepted file using its base name", async () => {
    const { saveBlob } = await import("@/lib/download")
    const blob = new Blob(["x"])
    vi.mocked(filesApi.download).mockResolvedValue(blob)
    const user = userEvent.setup()
    renderWithIntl(<SharedFilesBrowser />)

    await user.click(await screen.findByRole("button", { name: 'Download "photos/beach.png"' }))

    expect(filesApi.download).toHaveBeenCalledWith("key-2")
    await waitFor(() => expect(saveBlob).toHaveBeenCalledWith(blob, "beach.png"))
  })

  it("shows the empty state", async () => {
    vi.mocked(sharingApi.getSharedFiles).mockResolvedValue([])
    renderWithIntl(<SharedFilesBrowser />)

    expect(await screen.findByText("No shared files")).toBeInTheDocument()
    expect(screen.getByText("Files shared with you will appear here.")).toBeInTheDocument()
  })
})
