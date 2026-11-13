const KEYS = {
  pendingVerificationEmail: "pendingVerificationEmail",
  passwordResetEmail: "passwordResetEmail",
  resetFlowActive: "resetFlowActive",
  verifiedResetEmail: "verifiedResetEmail",
  resetToken: "resetToken",
} as const

export interface ResetSession {
  email: string
  resetToken: string
}

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.sessionStorage
}

export const authFlowStorage = {
  getPendingVerificationEmail(): string | null {
    return storage()?.getItem(KEYS.pendingVerificationEmail) ?? null
  },

  setPendingVerificationEmail(email: string) {
    storage()?.setItem(KEYS.pendingVerificationEmail, email)
  },

  clearPendingVerificationEmail() {
    storage()?.removeItem(KEYS.pendingVerificationEmail)
  },

  getPasswordResetEmail(): string | null {
    return storage()?.getItem(KEYS.passwordResetEmail) ?? null
  },

  startPasswordReset(email: string) {
    storage()?.setItem(KEYS.passwordResetEmail, email)
    storage()?.setItem(KEYS.resetFlowActive, "true")
  },

  completeResetVerification({ email, resetToken }: ResetSession) {
    storage()?.removeItem(KEYS.resetFlowActive)
    storage()?.removeItem(KEYS.passwordResetEmail)
    storage()?.setItem(KEYS.verifiedResetEmail, email)
    storage()?.setItem(KEYS.resetToken, resetToken)
  },

  getResetSession(): ResetSession | null {
    const email = storage()?.getItem(KEYS.verifiedResetEmail)
    const resetToken = storage()?.getItem(KEYS.resetToken)
    return email && resetToken ? { email, resetToken } : null
  },

  clearResetSession() {
    storage()?.removeItem(KEYS.verifiedResetEmail)
    storage()?.removeItem(KEYS.resetToken)
  },
}
