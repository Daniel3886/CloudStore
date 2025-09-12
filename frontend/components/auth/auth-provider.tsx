"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiUrl } from "@/lib/config"
import { useRouter } from "next/navigation"

interface User {
  email: string
  username?: string
  verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<boolean>
  loadUserProfile: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      await loadUserProfile()
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const loadUserProfile = async (): Promise<User | null> => {
    if (profileLoaded) return user

    try {
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")

      if (!accessToken && !refreshToken) return null

      let profile: User | null = null

      if (accessToken) {
        profile = await fetchProfileWithToken(accessToken)
      }

      if (!profile && refreshToken) {
        const refreshed = await refreshAccessTokenInternal()
        if (refreshed) {
          const newAccessToken = localStorage.getItem("accessToken")
          if (newAccessToken) profile = await fetchProfileWithToken(newAccessToken)
        }
      }

      setProfileLoaded(true) 
      return profile
    } catch (err) {
      console.error("Failed to load user profile:", err)
      return null
    }
  }

  const fetchProfileWithToken = async (accessToken: string): Promise<User | null> => {
    try {
      const res = await fetch(apiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return null

      const profile = await res.json()
      setUser({
        email: profile.email,
        username: profile.username,
        verified: profile.verified,
      })
      return profile
    } catch (err) {
      console.error("Failed to fetch profile:", err)
      return null
    }
  }

  const refreshAccessTokenInternal = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) return false

      const res = await fetch(apiUrl("/auth/refresh-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false

      const data = await res.json()
      localStorage.setItem("accessToken", data.accessToken)
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)

      return true
    } catch (err) {
      console.error("Token refresh failed:", err)
      return false
    }
  }

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    await loadUserProfile()
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
    setProfileLoaded(false) 
    router.push("/login")
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    return refreshAccessTokenInternal()
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isAuthenticated, refreshAccessToken, loadUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
