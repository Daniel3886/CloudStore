export const VALIDATION_LIMITS = {
  usernameMin: 3,
  usernameMax: 20,
  passwordMin: 8,
  passwordMax: 128,
  codeLength: 6,
} as const

export type ValidationErrorKey =
  | "emailRequired"
  | "emailInvalid"
  | "usernameRequired"
  | "usernameTooShort"
  | "usernameTooLong"
  | "passwordRequired"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordMissingNumber"
  | "passwordMissingLetter"
  | "confirmPasswordRequired"
  | "passwordsDoNotMatch"
  | "codeRequired"
  | "codeInvalidLength"

export type FieldErrors<Field extends string> = Partial<Record<Field, ValidationErrorKey>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): ValidationErrorKey | undefined {
  if (!email) return "emailRequired"
  if (!EMAIL_PATTERN.test(email)) return "emailInvalid"
}

export function validateUsername(username: string): ValidationErrorKey | undefined {
  if (!username) return "usernameRequired"
  if (username.length < VALIDATION_LIMITS.usernameMin) return "usernameTooShort"
  if (username.length > VALIDATION_LIMITS.usernameMax) return "usernameTooLong"
}

export function validateRequiredPassword(password: string): ValidationErrorKey | undefined {
  if (!password) return "passwordRequired"
}

export function validateNewPassword(password: string): ValidationErrorKey | undefined {
  if (!password) return "passwordRequired"
  if (password.length < VALIDATION_LIMITS.passwordMin) return "passwordTooShort"
  if (password.length > VALIDATION_LIMITS.passwordMax) return "passwordTooLong"
  if (!/\d/.test(password)) return "passwordMissingNumber"
  if (!/[a-zA-Z]/.test(password)) return "passwordMissingLetter"
}

export function validatePasswordConfirmation(password: string, confirmation: string): ValidationErrorKey | undefined {
  if (!confirmation) return "confirmPasswordRequired"
  if (password !== confirmation) return "passwordsDoNotMatch"
}

export function validateVerificationCode(code: string): ValidationErrorKey | undefined {
  if (!code) return "codeRequired"
  if (code.length !== VALIDATION_LIMITS.codeLength) return "codeInvalidLength"
}

export function hasErrors<Field extends string>(errors: FieldErrors<Field>): boolean {
  return Object.values(errors).some(Boolean)
}
