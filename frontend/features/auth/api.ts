import { api } from "@/lib/api/client"

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface UserProfile {
  username?: string
  email: string
  verified: boolean
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface ResetPasswordRequest {
  email: string
  resetToken: string
  newPassword: string
}

const publicRequest = { auth: false } as const

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenPair>("/auth/login", { ...publicRequest, json: { email, password } }),

  register: (request: RegisterRequest) => api.post<string>("/auth/register", { ...publicRequest, json: request }),

  async verifyAccount(email: string, verificationCode: string): Promise<string> {
    const text = await api.post<string>("/auth/verify-token", { ...publicRequest, json: { email, verificationCode } })
    const match = String(text).match(/Token:\s*(.+)/)
    return (match ? match[1] : String(text)).trim()
  },

  resendVerificationCode: (email: string) =>
    api.post<string>("/auth/resend-code", { ...publicRequest, json: { email } }),

  requestPasswordReset: (email: string) =>
    api.post<string>("/auth/forgot-password", { ...publicRequest, json: { email } }),

  async verifyPasswordResetCode(email: string, verificationCode: string): Promise<string> {
    const text = await api.post<string>("/auth/verify-password", {
      ...publicRequest,
      json: { email, verificationCode },
    })
    return String(text).trim()
  },

  resetPassword: ({ email, resetToken, newPassword }: ResetPasswordRequest) =>
    api.post<string>("/auth/reset-password", {
      ...publicRequest,
      json: { email, resetToken, newPassword, password: newPassword },
    }),

  getProfile: () => api.get<UserProfile>("/auth/me"),

  changePassword: (email: string, currentPassword: string, newPassword: string) =>
    api.post<unknown>("/auth/change-password", { json: { email, currentPassword, newPassword } }),

  deleteAccount: (email: string, password: string) =>
    api.delete<string>("/auth/delete-account", { json: { email, password } }),
}
