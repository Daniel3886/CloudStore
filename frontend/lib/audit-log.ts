import { getAccessToken } from "./auth"

export interface AuditLog {
  id: number
  action: string
  description: string
  performedBy: string
  fileId?: string
  timestamp: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchAllAuditLogs(): Promise<AuditLog[]> {

  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/activity/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`)
    }

    const logs: AuditLog[] = await response.json()
    return logs
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    throw error
  }
}

export async function fetchAuditLogsByPeriod(days = 30): Promise<AuditLog[]> {

  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/activity?days=${days}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`)
    }

    const logs: AuditLog[] = await response.json()
    return logs
  } catch (error) {
    throw error
  }
}
