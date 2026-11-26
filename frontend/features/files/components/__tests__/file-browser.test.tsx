import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { filesApi, type FileResponse } from "@/features/files/api"
import { FileBrowser } from "@/features/files/components/file-browser"
import { setVirtualFolders } from "@/features/files/lib/virtual-folders"
import { publicLinksApi } from "@/features/public-links/api"

vi.mock("@/features/files/api", () => ({
  filesApi: { list: vi.fn(), listTrash: vi.fn(), moveToTrash: vi.fn(), deleteFolder: vi.fn() },
}))
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }))
vi.mock("@/features/public-links/api", () => ({ publicLinksApi: { getActiveLinks: vi.fn() } }))

const api = vi.mocked(filesApi)

const backendFiles: FileResponse[] = [
  { id: 1, key: "k1", size: 1536, lastModified: "2024-01-01T00:00:00Z", displayName: "1700000000000-report.pdf" },
  { id: 2, key: "k2", size: 10, lastModified: "2024-01-01T00:00:00Z", displayName: "docs/notes.txt" },
]

describe("FileBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(publicLinksApi.getActiveLinks).mockResolvedValue([])
  })

  it("renders root files and virtual folders", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])

    renderWithIntl(<FileBrowser />)

    expect(screen.getByText("Loading files...")).toBeInTheDocument()
    expect(await screen.findByText("report.pdf")).toBeInTheDocument()
    expect(screen.getAllByText("1.5 kB").length).toBeGreaterThan(0)
    expect(screen.getByText("docs")).toBeInTheDocument()
    expect(screen.getAllByText("1 item").length).toBeGreaterThan(0)
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument()
  })

  it("navigates into a folder when it is clicked", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])
    const onCurrentPathChange = vi.fn()

    renderWithIntl(<FileBrowser onCurrentPathChange={onCurrentPathChange} />)
    await userEvent.click(await screen.findByText("docs"))

    expect(onCurrentPathChange).toHaveBeenCalledWith("docs")
  })

  it("reloads files and saved folders when the refresh signal changes without remounting", async () => {
    api.list.mockResolvedValue(backendFiles)
    const { rerender } = renderWithIntl(<FileBrowser />)
    expect(await screen.findByText("report.pdf")).toBeInTheDocument()

    setVirtualFolders(["new-folder"])
    api.list.mockResolvedValue([
      ...backendFiles,
      { id: 3, key: "k3", size: 1, lastModified: "2024-01-01T00:00:00Z", displayName: "uploaded.txt" },
    ])
    rerender(<FileBrowser refreshSignal={1} />)

    expect(screen.getByText("report.pdf")).toBeInTheDocument()
    expect(await screen.findByText("uploaded.txt")).toBeInTheDocument()
    expect(screen.getByText("new-folder")).toBeInTheDocument()
    expect(api.list).toHaveBeenCalledTimes(2)
  })

  it("opens folders from the keyboard", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])
    const onCurrentPathChange = vi.fn()
    const user = userEvent.setup()

    renderWithIntl(<FileBrowser onCurrentPathChange={onCurrentPathChange} />)
    const folder = await screen.findByRole("button", { name: "docs" })
    folder.focus()
    await user.keyboard("{Enter}")

    expect(onCurrentPathChange).toHaveBeenCalledWith("docs")
  })

  it("labels folder deletion as permanent", async () => {
    api.list.mockResolvedValue(backendFiles)
    setVirtualFolders(["docs"])
    const user = userEvent.setup()

    renderWithIntl(<FileBrowser />)
    await user.click(await screen.findByRole("button", { name: "Actions for docs" }))

    expect(await screen.findByRole("menuitem", { name: "Delete Permanently" })).toBeInTheDocument()
    expect(screen.queryByRole("menuitem", { name: "Move to Trash" })).not.toBeInTheDocument()
  })

  it("shows the folder contents with breadcrumbs and a back button", async () => {
    api.list.mockResolvedValue(backendFiles)
    const onCurrentPathChange = vi.fn()

    renderWithIntl(<FileBrowser currentPath="docs" onCurrentPathChange={onCurrentPathChange} />)

    expect(await screen.findByText("notes.txt")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Current folder" })).toHaveTextContent("My Files / docs")
    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(onCurrentPathChange).toHaveBeenCalledWith("")
  })

  it("filters by search query", async () => {
    api.list.mockResolvedValue(backendFiles)
    renderWithIntl(<FileBrowser searchQuery="nothing-matches" />)
    expect(await screen.findByText("No files found")).toBeInTheDocument()
    expect(screen.getByText("Upload some files or create a folder to get started")).toBeInTheDocument()
  })

  it("shows the trash empty state", async () => {
    api.listTrash.mockResolvedValue([])
    renderWithIntl(<FileBrowser type="trash" />)
    expect(await screen.findByText("Trash is empty")).toBeInTheDocument()
    expect(api.list).not.toHaveBeenCalled()
  })

  it("treats a 404 from the list endpoint as an empty list", async () => {
    const { ApiError } = await import("@/lib/api/client")
    api.list.mockRejectedValue(new ApiError(404, "Not found"))
    renderWithIntl(<FileBrowser />)
    expect(await screen.findByText("No files found")).toBeInTheDocument()
  })

  it("moves a file to trash after confirmation and reloads the list", async () => {
    api.list.mockResolvedValueOnce(backendFiles).mockResolvedValueOnce([backendFiles[1]])
    api.moveToTrash.mockResolvedValue("ok")
    const user = userEvent.setup()

    renderWithIntl(<FileBrowser />)
    await user.click(await screen.findByRole("button", { name: "Actions for report.pdf" }))
    await user.click(await screen.findByRole("menuitem", { name: "Move to Trash" }))
    expect(
      await screen.findByText(
        'Move "report.pdf" to Trash? You can restore it from Trash for 30 days. After that it\'s deleted for good.',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Move to Trash" }))

    expect(api.moveToTrash).toHaveBeenCalledWith("k1")
    await waitFor(() => expect(screen.queryByText("report.pdf")).not.toBeInTheDocument())
    expect(api.list).toHaveBeenCalledTimes(2)
  })

  it("shows files as a sortable list with dates and public links", async () => {
    api.list.mockResolvedValue([
      { id: 1, key: "k1", size: 4_300_000, lastModified: "2024-03-01T00:00:00Z", displayName: "big.pdf" },
      { id: 2, key: "k2", size: 10, lastModified: "2024-01-01T00:00:00Z", displayName: "small.txt" },
    ])
    vi.mocked(publicLinksApi.getActiveLinks).mockResolvedValue([
      {
        id: 9,
        token: "t",
        file: { id: 1, displayName: "big.pdf", s3Key: "k1", size: 4_300_000 },
        expiresAt: new Date(Date.now() + 5 * 3_600_000 + 60_000).toISOString(),
        active: true,
      },
    ])
    const user = userEvent.setup()
    renderWithIntl(<FileBrowser />)

    const table = await screen.findByRole("table", { name: "Files and folders" })
    const names = () =>
      within(table)
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.querySelector("[title]")?.getAttribute("title"))
    expect(names()).toEqual(["big.pdf", "small.txt"])
    expect((await within(table).findAllByText("5 h left")).length).toBeGreaterThan(0)
    expect(within(table).getAllByText("4.1 MB").length).toBeGreaterThan(0)

    await user.click(within(table).getByRole("button", { name: "Size" }))
    expect(names()).toEqual(["big.pdf", "small.txt"])
    await user.click(within(table).getByRole("button", { name: "Size" }))
    expect(names()).toEqual(["small.txt", "big.pdf"])
    expect(within(table).getByRole("columnheader", { name: "Size" })).toHaveAttribute("aria-sort", "ascending")
  })

  it("switches to the grid and remembers the choice", async () => {
    api.list.mockResolvedValue(backendFiles)
    const user = userEvent.setup()
    const { unmount } = renderWithIntl(<FileBrowser />)

    await screen.findByRole("table")
    await user.click(screen.getByRole("button", { name: "Grid" }))
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true")
    unmount()

    renderWithIntl(<FileBrowser />)
    expect(await screen.findByText("report.pdf")).toBeInTheDocument()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })

  it("shows how long each trashed file has left", async () => {
    const day = 24 * 3_600_000
    api.listTrash.mockResolvedValue([
      {
        id: 1,
        key: "k1",
        size: 10,
        displayName: "old.txt",
        purgeAt: new Date(Date.now() + 2 * day - 60_000).toISOString(),
      },
      { id: 2, key: "k2", size: 10, displayName: "new.txt", purgeAt: new Date(Date.now() + 29 * day).toISOString() },
      { id: 3, key: "k3", size: 10, displayName: "legacy.txt" },
    ])
    renderWithIntl(<FileBrowser type="trash" />)

    const table = await screen.findByRole("table")
    const rows = within(table).getAllByRole("row").slice(1)
    expect(rows.map((row) => row.querySelector("[title]")?.getAttribute("title"))).toEqual([
      "old.txt",
      "new.txt",
      "legacy.txt",
    ])
    expect(within(rows[0]).getByText("2 days left")).toHaveClass("text-warning")
    expect(within(rows[1]).getByText("29 days left")).not.toHaveClass("text-warning")
    expect(screen.queryByText("In Trash")).not.toBeInTheDocument()
    expect(publicLinksApi.getActiveLinks).not.toHaveBeenCalled()
  })
})
