import { api } from "@/lib/api/client"

export interface AuditLog {
  action: string
  performedBy: string
  description: string
  timestamp: string
  fileDisplayName?: string
}

export function fetchAllAuditLogs(): Promise<AuditLog[]> {
  return api.get<AuditLog[]>("/activity/all", { errorMessage: "Failed to fetch audit logs" })
}

export function fetchAuditLogsByPeriod(days = 30): Promise<AuditLog[]> {
  return api.get<AuditLog[]>("/activity", { query: { days }, errorMessage: "Failed to fetch audit logs" })
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
