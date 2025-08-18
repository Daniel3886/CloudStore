export interface AuditLog {
  id: number
  action: string
  description: string
  performedBy: string
  fileId?: string
  timestamp: string
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  const accessToken = localStorage.getItem("accessToken")
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })
}

export class AuditLogAPI {
  static async getAllLogs(): Promise<AuditLog[]> {
    console.log("🔍 [AUDIT API] Getting all audit logs")

    const response = await makeAuthenticatedRequest("http://localhost:8080/activity/all")

    console.log("🔍 [AUDIT API] Get all logs response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [AUDIT API] Get all logs error:", errorText)
      throw new Error(errorText || "Failed to fetch audit logs")
    }

    const logs = await response.json()
    console.log("✅ [AUDIT API] Get all logs success:", logs.length, "logs")

    return logs
  }

  static async getLogsByPeriod(days = 30): Promise<AuditLog[]> {
    console.log("🔍 [AUDIT API] Getting audit logs for period:", days, "days")

    const response = await makeAuthenticatedRequest(`http://localhost:8080/activity?days=${days}`)

    console.log("🔍 [AUDIT API] Get logs by period response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [AUDIT API] Get logs by period error:", errorText)
      throw new Error(errorText || "Failed to fetch audit logs")
    }

    const logs = await response.json()
    console.log("✅ [AUDIT API] Get logs by period success:", logs.length, "logs")

    return logs
  }
}
