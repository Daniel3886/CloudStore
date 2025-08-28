import { getAccessToken } from "./auth"

export interface AuditLog {
  action: string
  performedBy: string
  description: string
  timestamp: string
  fileDisplayName?: string
}

export async function fetchAllAuditLogs(): Promise<AuditLog[]> {

  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch("http://localhost:8080/activity/all", {
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

export async function fetchAuditLogsByPeriod(days = 30): Promise<AuditLog[]> {

  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`http://localhost:8080/activity?days=${days}`, {
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

export const ACTIONS_WITH_FILE_DISPLAY = [
  "PUBLIC_FILE_ACCESS",
  "PUBLIC_LINK_GENERATION",
  "PUBLIC_LINK_REVOCATION",
  "SHARE_FILE",
  "REVOKE_ACCESS",
  "UPDATE_MESSAGE",
  "REMOVE_MESSAGE",
  "FILE_MOVE",
]

export const ACTIONS_WITH_FILE_IN_DESCRIPTION = [
  "FILE_UPLOAD",
  "FILE_DELETE",
  "FILE_RENAME",
  "FILE_SOFT_DELETE",
  "FILE_RESTORE",
  "FILE_PERMANENT_DELETE",
]

export function shouldShowFileName(action: string): boolean {
  return ACTIONS_WITH_FILE_DISPLAY.includes(action)
}

export function isFileRelatedAction(action: string): boolean {
  return ACTIONS_WITH_FILE_DISPLAY.includes(action) || ACTIONS_WITH_FILE_IN_DESCRIPTION.includes(action)
}
