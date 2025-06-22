"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (formData.username.length > 20) {
      toast({
        title: "Invalid username",
        description: "Username must be no more than 20 characters long.",
        variant: "destructive",
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length > 128) {
      toast({
        title: "Password too long",
        description: "Password must be no more than 128 characters long.",
        variant: "destructive",
      })
      return false
    }

    if (!/\d/.test(formData.password)) {
      toast({
        title: "Weak password",
        description: "Password must contain at least one number.",
        variant: "destructive",
      })
      return false
    }

    if (!/[a-zA-Z]/.test(formData.password)) {
      toast({
        title: "Weak password",
        description: "Password must contain at least one letter.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const parseBackendError = (responseText: string, defaultMessage: string) => {
    try {
      const errorData = JSON.parse(responseText)
      if (errorData.message) {
        return errorData.message
      }
      if (errorData.error) {
        return errorData.error
      }
      return defaultMessage
    } catch {
      return responseText || defaultMessage
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebugInfo(null)

    if (!validateForm()) return

    setIsLoading(true)
    setDebugInfo("Validation passed, sending registration request...")

    try {
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }

      setDebugInfo(
        (prev) =>
          `${prev}\nSending request to: http://localhost:8080/auth/register\nPayload: ${JSON.stringify(requestBody)}`,
      )

      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "include",
      })

      setDebugInfo((prev) => `${prev}\nResponse received: Status ${response.status}`)

      const responseText = await response.text()
      setDebugInfo((prev) => `${prev}\nResponse body: ${responseText}`)

      if (response.ok) {
        setDebugInfo((prev) => `${prev}\nRegistration successful!`)
        toast({
          title: "Account created!",
          description: "Please check your email for verification code.",
        })

        sessionStorage.setItem("pendingVerificationEmail", formData.email)
        router.push("/verify")
      } else {
        const errorMsg = parseBackendError(responseText, "Registration failed")
        setDebugInfo((prev) => `${prev}\nRegistration failed: ${errorMsg}`)
        toast({
          title: "Registration failed",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setDebugInfo((prev) => `${prev}\nCaught error: ${error.message}`)
      toast({
        title: "Network error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Create your CloudStore account to get started with secure file storage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>At least 8 characters long</li>
            <li>Contains at least one letter</li>
            <li>Contains at least one number</li>
          </ul>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>

        <div className="text-center pt-2">
          <span className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </span>
        </div>
      </form>

      {debugInfo && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
          <p className="font-semibold mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}
    </div>
  )
}
