"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, type UserProfile } from "@/features/auth/api"
import { ApiError, onSessionExpired } from "@/lib/api/client"
import { clearTokens, hasStoredSession, setTokens, setUserEmail } from "@/lib/session"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  profileUnavailable: boolean
  login: (accessToken: string, refreshToken?: string) => Promise<UserProfile | null>
  logout: () => void
  loadUserProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function isSessionRejected(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileUnavailable, setProfileUnavailable] = useState(false)
  const router = useRouter()

  const loadUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!hasStoredSession()) {
      setUser(null)
      setProfileUnavailable(false)
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
      setProfileUnavailable(false)
      return nextUser
    } catch (error) {
      if (isSessionRejected(error)) {
        setUser(null)
        setProfileUnavailable(false)
      } else {
        setProfileUnavailable(true)
      }
      return null
    }
  }, [])

  useEffect(() => {
    loadUserProfile().finally(() => setIsLoading(false))
  }, [loadUserProfile])

  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null)
        setProfileUnavailable(false)
      }),
    [],
  )

  const login = useCallback(
    async (accessToken: string, refreshToken?: string) => {
      setTokens(accessToken, refreshToken)
      return loadUserProfile()
    },
    [loadUserProfile],
  )

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setProfileUnavailable(false)
    router.push("/login")
  }, [router])

  const value = useMemo<AuthContextType>(
    () => ({ user, isLoading, isAuthenticated: !!user, profileUnavailable, login, logout, loadUserProfile }),
    [user, isLoading, profileUnavailable, login, logout, loadUserProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
