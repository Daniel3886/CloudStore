import { validateNewPassword, validatePasswordConfirmation, type ValidationErrorKey } from "@/lib/validation"

export interface PasswordChangeValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type PasswordChangeError = "missingFields" | ValidationErrorKey

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
  return (
    validateNewPassword(values.newPassword) ??
    validatePasswordConfirmation(values.newPassword, values.confirmPassword) ??
    null
  )
}
