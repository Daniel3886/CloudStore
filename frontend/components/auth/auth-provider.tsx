"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  email: string
  username?: string
  verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string, email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken")
      const email = localStorage.getItem("userEmail")

      if (token && email) {
        setUser({
          email,
          verified: true, // If they have a token, they're verified
        })
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (token: string, email: string) => {
    localStorage.setItem("authToken", token)
    localStorage.setItem("userEmail", email)
    setUser({
      email,
      verified: true,
    })
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    sessionStorage.removeItem("pendingVerificationEmail")
    setUser(null)
    router.push("/login")
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
