import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { AuditLogBrowser } from "@/features/activity/components/audit-log-browser"
import { fetchAllAuditLogs, fetchAuditLogsByPeriod, type AuditLog } from "@/features/activity/api"
import { ApiError } from "@/lib/api/client"
import { renderWithIntl } from "@/test/render"

vi.mock("@/features/activity/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/activity/api")>()
  return { ...actual, fetchAllAuditLogs: vi.fn(), fetchAuditLogsByPeriod: vi.fn() }
})

const logs: AuditLog[] = [
  {
    action: "FILE_UPLOAD",
    performedBy: "jane@example.com",
    description: "Uploaded report.pdf",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    action: "SHARE_FILE",
    performedBy: "jane@example.com",
    description: "Shared a file with bob@example.com",
    timestamp: new Date(Date.now() - 10 * 1000).toISOString(),
    fileDisplayName: "notes.txt",
  },
  {
    action: "BRAND_NEW_ACTION",
    performedBy: "jane@example.com",
    description: "Something new happened",
    timestamp: "2020-01-01T10:00:00Z",
  },
]

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
})

beforeEach(() => {
  vi.mocked(fetchAuditLogsByPeriod).mockResolvedValue(logs)
  vi.mocked(fetchAllAuditLogs).mockResolvedValue([])
})

describe("AuditLogBrowser", () => {
  it("renders logs with translated labels and file names", async () => {
    renderWithIntl(<AuditLogBrowser />)

    expect(await screen.findByText("File uploaded")).toBeInTheDocument()
    expect(fetchAuditLogsByPeriod).toHaveBeenCalledWith(30)
    expect(screen.getByText("Uploaded report.pdf")).toBeInTheDocument()
    expect(screen.getByText("File shared")).toBeInTheDocument()
    expect(screen.getByLabelText("File: notes.txt")).toBeInTheDocument()
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument()
    expect(screen.getByText(/Just now/)).toBeInTheDocument()
  })

  it("falls back to the raw code for unknown actions", async () => {
    renderWithIntl(<AuditLogBrowser />)

    expect(await screen.findByText("BRAND NEW ACTION")).toBeInTheDocument()
    expect(screen.getByText("Something new happened")).toBeInTheDocument()
  })

  it("refetches when the period changes", async () => {
    const user = userEvent.setup()
    renderWithIntl(<AuditLogBrowser />)
    await screen.findByText("File uploaded")

    await user.click(screen.getByRole("combobox", { name: "Time period" }))
    await user.click(await screen.findByRole("option", { name: "Last 7 days" }))
    await waitFor(() => expect(fetchAuditLogsByPeriod).toHaveBeenLastCalledWith(7))

    await user.click(screen.getByRole("combobox", { name: "Time period" }))
    await user.click(await screen.findByRole("option", { name: "Last 90 days" }))
    await waitFor(() => expect(fetchAuditLogsByPeriod).toHaveBeenLastCalledWith(90))
  })

  it("fetches all logs when 'All time' is selected", async () => {
    const user = userEvent.setup()
    renderWithIntl(<AuditLogBrowser />)
    await screen.findByText("File uploaded")

    await user.click(screen.getByRole("combobox", { name: "Time period" }))
    await user.click(await screen.findByRole("option", { name: "All time" }))

    await waitFor(() => expect(fetchAllAuditLogs).toHaveBeenCalledTimes(1))
    expect(await screen.findByText("No activities recorded yet.")).toBeInTheDocument()
  })

  it("shows the empty state for the selected period", async () => {
    vi.mocked(fetchAuditLogsByPeriod).mockResolvedValue([])
    renderWithIntl(<AuditLogBrowser />)

    expect(await screen.findByText("No activity found")).toBeInTheDocument()
    expect(screen.getByText("No activities recorded in the last 30 days.")).toBeInTheDocument()
  })

  it("shows an error state and retries", async () => {
    vi.mocked(fetchAuditLogsByPeriod).mockRejectedValueOnce(new ApiError(500, "Internal Server Error"))
    const user = userEvent.setup()
    renderWithIntl(<AuditLogBrowser />)

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load activity logs. Please try again.")
    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(await screen.findByText("File uploaded")).toBeInTheDocument()
    expect(fetchAuditLogsByPeriod).toHaveBeenCalledTimes(2)
  })

  it("refreshes the current period", async () => {
    const user = userEvent.setup()
    renderWithIntl(<AuditLogBrowser />)
    await screen.findByText("File uploaded")

    await user.click(screen.getByRole("button", { name: "Refresh activity" }))

    await waitFor(() => expect(fetchAuditLogsByPeriod).toHaveBeenCalledTimes(2))
    expect(fetchAuditLogsByPeriod).toHaveBeenLastCalledWith(30)
  })
})
