export const MIN_PASSWORD_LENGTH = 8

export interface PasswordChangeValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type PasswordChangeError = "missingFields" | "mismatch" | "tooShort"

export const EMPTY_PASSWORD_CHANGE: PasswordChangeValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function isPasswordChangeComplete(values: PasswordChangeValues): boolean {
  return Boolean(values.currentPassword && values.newPassword && values.confirmPassword)
}

export function validatePasswordChange(values: PasswordChangeValues): PasswordChangeError | null {
  if (!isPasswordChangeComplete(values)) return "missingFields"
  if (values.newPassword !== values.confirmPassword) return "mismatch"
  if (values.newPassword.length < MIN_PASSWORD_LENGTH) return "tooShort"
  return null
}
