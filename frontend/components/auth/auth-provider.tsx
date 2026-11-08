"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, type UserProfile } from "@/lib/api/auth"
import { onSessionExpired } from "@/lib/api/client"
import { clearTokens, hasStoredSession, setTokens, setUserEmail } from "@/lib/auth"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken?: string) => Promise<void>
  logout: () => void
  loadUserProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!hasStoredSession()) {
      setUser(null)
      return null
    }

    try {
      const profile = await authApi.getProfile()
      const nextUser: UserProfile = {
        email: profile.email,
        username: profile.username,
        verified: profile.verified,
      }
      setUserEmail(nextUser.email)
      setUser(nextUser)
      return nextUser
    } catch (error) {
      console.error("Failed to load user profile:", error)
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    loadUserProfile().finally(() => setIsLoading(false))
  }, [loadUserProfile])

  useEffect(() => onSessionExpired(() => setUser(null)), [])

  const login = useCallback(
    async (accessToken: string, refreshToken?: string) => {
      setTokens(accessToken, refreshToken)
      await loadUserProfile()
    },
    [loadUserProfile],
  )

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    router.push("/login")
  }, [router])

  const value = useMemo<AuthContextType>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout, loadUserProfile }),
    [user, isLoading, login, logout, loadUserProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
