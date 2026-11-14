export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string>
}

export function extractErrorMessage(responseText: string, fallback: string): string {
  const text = responseText?.trim()
  if (!text) return fallback

  try {
    const body = JSON.parse(text) as ApiErrorBody
    return body.message || body.error || fallback
  } catch {
    return text
  }
}

export type ApiErrorKey =
  | "network"
  | "rateLimited"
  | "fileTooLarge"
  | "emailInUse"
  | "emailDomainInvalid"
  | "invalidCredentials"
  | "currentPasswordIncorrect"
  | "samePassword"
  | "accountNotVerified"
  | "pendingVerification"
  | "alreadyVerified"
  | "invalidCode"
  | "codeExpired"
  | "emailSendFailed"
  | "userNotFound"
  | "recipientNotFound"
  | "shareWithSelf"
  | "sharePending"
  | "linkExpired"
  | "linkInvalid"
  | "fileNotFound"
  | "notAllowed"

const EXACT_MESSAGES: Record<string, ApiErrorKey> = {
  "Email already in use.": "emailInUse",
  "Email domain is invalid.": "emailDomainInvalid",
  "Invalid password.": "invalidCredentials",
  "Current password is incorrect.": "currentPasswordIncorrect",
  "New password must be different from current password.": "samePassword",
  "New password must be different from the current password.": "samePassword",
  "Please verify your account before logging in.": "accountNotVerified",
  "This email is pending verification. Please request a new code.": "pendingVerification",
  "User is already verified.": "alreadyVerified",
  "Invalid verification code.": "invalidCode",
  "Verification code has expired.": "codeExpired",
  "Failed to send verification email": "emailSendFailed",
  "Email not found.": "userNotFound",
  "User not found.": "userNotFound",
  "User not found": "userNotFound",
  "User not found or not verified": "userNotFound",
  "User with this email not found.": "userNotFound",
  "Recipient not found": "recipientNotFound",
  "Target user not found": "recipientNotFound",
  "You cannot share a file with yourself.": "shareWithSelf",
  "A share request is already pending for this user.": "sharePending",
  "This link has expired.": "linkExpired",
  "Invalid or inactive public link.": "linkInvalid",
  "File not found": "fileNotFound",
  "File not found in metadata": "fileNotFound",
  "You do not own this file": "notAllowed",
  "User does not have access to this file": "notAllowed",
}

const PREFIX_MESSAGES: [string, ApiErrorKey][] = [
  ["Please wait ", "rateLimited"],
  ["File not found: ", "fileNotFound"],
  ["Only the owner", "notAllowed"],
  ["Only the file owner", "notAllowed"],
  ["You are not authorized", "notAllowed"],
]

export function getApiErrorKey(status: number, message: string): ApiErrorKey | undefined {
  if (status === 0) return "network"

  const text = message.trim()
  const known = EXACT_MESSAGES[text] ?? PREFIX_MESSAGES.find(([prefix]) => text.startsWith(prefix))?.[1]
  if (known) return known

  if (status === 413) return "fileTooLarge"
  if (status === 429) return "rateLimited"
  return undefined
}
