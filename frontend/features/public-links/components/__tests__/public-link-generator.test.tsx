import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { toast } from "@/hooks/use-toast"
import { publicLinksApi } from "@/features/public-links/api"
import { PublicLinkGenerator } from "@/features/public-links/components/public-link-generator"

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/features/public-links/api", () => ({ publicLinksApi: { generatePublicLink: vi.fn() } }))

const file = { id: 5, name: "photo.png", size: 3 * 1024 * 1024 }

describe("PublicLinkGenerator", () => {
  beforeEach(() => {
    vi.mocked(publicLinksApi.generatePublicLink).mockResolvedValue({
      downloadLink: "https://x.test/d/abc",
      previewLink: "https://x.test/p/abc",
    })
  })

  it("shows the file details before generating", () => {
    renderWithIntl(<PublicLinkGenerator open onOpenChange={vi.fn()} file={file} />)

    expect(screen.getByText("photo.png")).toBeInTheDocument()
    expect(screen.getByText("Size: 3 MB")).toBeInTheDocument()
    expect(screen.getByText("24h expiry")).toBeInTheDocument()
  })

  it("generates preview and download links", async () => {
    const user = userEvent.setup()
    renderWithIntl(<PublicLinkGenerator open onOpenChange={vi.fn()} file={file} />)

    await user.click(screen.getByRole("button", { name: "Generate Public Link" }))

    expect(publicLinksApi.generatePublicLink).toHaveBeenCalledWith(5)
    expect(await screen.findByText("Public Link Generated!")).toBeInTheDocument()
    expect(screen.getByLabelText("Download Link")).toHaveValue("https://x.test/d/abc")
    expect(screen.getByLabelText("Preview Link")).toHaveValue("https://x.test/p/abc")

    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    await user.click(screen.getByRole("button", { name: "Copy preview link" }))
    expect(writeText).toHaveBeenCalledWith("https://x.test/p/abc")

    await user.click(screen.getByRole("button", { name: "Generate Another Link" }))
    expect(screen.getByRole("button", { name: "Generate Public Link" })).toBeInTheDocument()
  })

  it("shows only the download link and the size-limit message for large files", async () => {
    vi.mocked(publicLinksApi.generatePublicLink).mockResolvedValue({
      downloadLink: "https://x.test/d/big",
      message: "File too large for preview",
    })
    const user = userEvent.setup()
    renderWithIntl(<PublicLinkGenerator open onOpenChange={vi.fn()} file={{ id: 6, name: "big.iso" }} />)

    expect(screen.getByText("Size: Unknown size")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Generate Public Link" }))

    expect(await screen.findByLabelText("Download Link")).toHaveValue("https://x.test/d/big")
    expect(screen.queryByLabelText("Preview Link")).not.toBeInTheDocument()
    expect(screen.getByText("File too large for preview")).toBeInTheDocument()
  })

  it("disables the button while generating and reports failures", async () => {
    let reject: (error: Error) => void = () => {}
    vi.mocked(publicLinksApi.generatePublicLink).mockReturnValue(
      new Promise((_, r) => {
        reject = r
      }),
    )
    const user = userEvent.setup()
    renderWithIntl(<PublicLinkGenerator open onOpenChange={vi.fn()} file={file} />)

    await user.click(screen.getByRole("button", { name: "Generate Public Link" }))
    expect(screen.getByRole("button", { name: "Generating..." })).toBeDisabled()

    reject(new Error("Quota exceeded"))

    expect(await screen.findByRole("button", { name: "Generate Public Link" })).toBeEnabled()
    expect(toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Failed to generate link",
      description: "Quota exceeded",
    })
  })
})
