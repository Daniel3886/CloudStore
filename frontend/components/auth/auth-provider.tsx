"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import { getToken, clearTokens, isTokenExpired } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()

      if (token && !isTokenExpired(token)) {
        try {
          // API Call: GET /api/auth/me
          // Expected headers: Authorization: Bearer {token}
          // Expected response: { user: User }

          const response = await fetch("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            clearTokens()
          }
        } catch (error) {
          clearTokens()
        }
      } else if (token) {
        // Token expired
        clearTokens()
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (token: string, userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    router.push("/login")
  }

  const refreshUser = async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
