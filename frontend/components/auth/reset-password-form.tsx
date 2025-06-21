"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Lock, ArrowLeft, CheckCircle } from "lucide-react"

export function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isValidSession, setIsValidSession] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem("verifiedResetEmail")

    setDebugInfo(`Verified email from session: ${verifiedEmail ? "Present" : "Missing"}`)

    if (verifiedEmail) {
      setEmail(verifiedEmail)
      setIsValidSession(true)
    } else {
      toast({
        title: "Invalid session",
        description: "Please start the password reset process from the beginning.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setDebugInfo("Sending password reset request...")

    try {
      const requestBody = {
        email,
        newPassword: formData.password,
      }

      setDebugInfo(
        (prev) =>
          `${prev}\nSending request to: http://localhost:8080/auth/reset-password\nPayload: ${JSON.stringify({ email, newPassword: formData.password })}`,
      )

      const response = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "include",
      })

      setDebugInfo((prev) => `${prev}\nResponse status: ${response.status}`)

      const responseText = await response.text()
      setDebugInfo((prev) => `${prev}\nResponse: ${responseText}`)

      if (response.ok) {
        setDebugInfo((prev) => `${prev}\nPassword reset successful!`)
        setResetSuccess(true)

        sessionStorage.removeItem("verifiedResetEmail")

        toast({
          title: "Password reset successful!",
          description: "Your password has been updated. You can now sign in.",
        })

        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        const errorMsg = responseText || "Failed to reset password"
        setDebugInfo((prev) => `${prev}\nFailed: ${errorMsg}`)
        toast({
          title: "Reset failed",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setDebugInfo((prev) => `${prev}\nError: ${error.message}`)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <div className="h-8 w-8 text-red-600 dark:text-red-400">⚠️</div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Invalid Session</h3>
          <p className="text-sm text-muted-foreground">Please start the password reset process from the beginning.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Start password reset</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-32 text-left">
            <p className="font-semibold mb-1">Debug Information:</p>
            {debugInfo}
          </div>
        )}
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Password Reset Successful!</h3>
          <p className="text-sm text-muted-foreground">Your password has been successfully updated.</p>
          <p className="text-xs text-muted-foreground mt-2">You'll be redirected to the login page shortly...</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={() => router.push("/login")} className="w-full">
            Go to Login
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-32 text-left">
            <p className="font-semibold mb-1">Debug Information:</p>
            {debugInfo}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
          {email && <p className="text-xs text-muted-foreground">Resetting password for: {email}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
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

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>

      {debugInfo && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-32">
          <p className="font-semibold mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}

      <div className="text-center">
        <Button variant="ghost" asChild className="h-auto p-0">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to login
          </Link>
        </Button>
      </div>
    </div>
  )
}
