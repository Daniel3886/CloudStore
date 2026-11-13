import {
  Activity,
  Download,
  Edit,
  Eye,
  FolderPlus,
  Link,
  MessageSquare,
  RefreshCw,
  Share2,
  Trash2,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

export const KNOWN_ACTIONS = [
  "FILE_UPLOAD",
  "FILE_DELETE",
  "FILE_SOFT_DELETE",
  "FILE_PERMANENT_DELETE",
  "FILE_RESTORE",
  "FILE_RENAME",
  "FILE_MOVE",
  "SHARE_FILE",
  "RESHARE_FILE",
  "REVOKE_ACCESS",
  "ACCEPT_SHARE",
  "DECLINE_SHARE",
  "SHARE_ACCEPTED",
  "SHARE_DECLINED",
  "UPDATE_MESSAGE",
  "REMOVE_MESSAGE",
  "PUBLIC_LINK_GENERATION",
  "PUBLIC_LINK_REVOCATION",
  "PUBLIC_FILE_ACCESS",
  "USER_REGISTER",
  "PASSWORD_CHANGE",
] as const

export type KnownAction = (typeof KNOWN_ACTIONS)[number]

export function isKnownAction(action: string): action is KnownAction {
  return (KNOWN_ACTIONS as readonly string[]).includes(action)
}

export function formatActionCode(action: string): string {
  return action.replace(/_/g, " ").trim()
}

export type ActionTone = "create" | "access" | "share" | "destructive" | "edit" | "restore" | "neutral"

const includesAny = (value: string, needles: string[]) => needles.some((needle) => value.includes(needle))

export function getActionIcon(action: string): LucideIcon {
  const value = action.toLowerCase()

  if (value.includes("upload")) return Upload
  if (includesAny(value, ["download", "access"])) return Download
  if (value.includes("share")) return Share2
  if (includesAny(value, ["delete", "trash"])) return Trash2
  if (includesAny(value, ["edit", "rename", "update", "move"])) return Edit
  if (value.includes("restore")) return RefreshCw
  if (value.includes("view")) return Eye
  if (includesAny(value, ["folder", "create"])) return FolderPlus
  if (value.includes("register")) return UserPlus
  if (includesAny(value, ["link", "public"])) return Link
  if (value.includes("message")) return MessageSquare
  if (value.includes("revoke")) return Trash2

  return Activity
}

export function getActionTone(action: string): ActionTone {
  const value = action.toLowerCase()

  if (includesAny(value, ["upload", "create", "register"])) return "create"
  if (includesAny(value, ["download", "access"])) return "access"
  if (includesAny(value, ["share", "link", "public"])) return "share"
  if (includesAny(value, ["delete", "trash", "revoke"])) return "destructive"
  if (includesAny(value, ["edit", "rename", "update", "move", "message"])) return "edit"
  if (value.includes("restore")) return "restore"

  return "neutral"
}

export const ACTION_TONE_CLASSES: Record<ActionTone, string> = {
  create:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800",
  access: "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800",
  share:
    "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800",
  destructive: "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800",
  edit: "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800",
  restore:
    "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800",
  neutral:
    "bg-slate-500/10 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-800",
}
