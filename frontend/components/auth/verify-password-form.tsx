"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Shield, ArrowLeft } from "lucide-react"

export function VerifyPasswordForm() {
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const passwordResetEmail = sessionStorage.getItem("passwordResetEmail")
    if (passwordResetEmail) {
      setFormData((prev) => ({ ...prev, email: passwordResetEmail }))
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo(null)

    try {
      setDebugInfo("Sending password reset verification request...")

      const requestBody = {
        email: formData.email,
        verificationCode: formData.verificationCode,
      }

      const endpoint = "http://localhost:8080/auth/verify-password"

      setDebugInfo((prev) => `${prev}\nSending request to: ${endpoint}\nPayload: ${JSON.stringify(requestBody)}`)

      const response = await fetch(endpoint, {
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
        const resetToken = responseText.trim()

        sessionStorage.removeItem("resetFlowActive")
        sessionStorage.removeItem("passwordResetEmail")

        sessionStorage.setItem("verifiedResetEmail", formData.email)
        sessionStorage.setItem("resetToken", resetToken)

        setDebugInfo((prev) => `${prev}\nVerification successful! Redirecting to reset password...`)
        toast({
          title: "Code verified!",
          description: "You can now set your new password.",
        })

        router.push("/reset-password")
      } else {
        const errorMsg = responseText || `Verification failed: ${response.status}`
        setDebugInfo((prev) => `${prev}\nVerification failed: ${errorMsg}`)
        throw new Error(errorMsg)
      }
    } catch (error: any) {
      setDebugInfo((prev) => `${prev}\nCaught error: ${error.message}`)
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      const endpoint = "http://localhost:8080/auth/forgot-password"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
        mode: "cors",
        credentials: "include",
      })

      const responseText = await response.text()

      if (response.ok) {
        toast({
          title: "Code sent!",
          description: "A new verification code has been sent to your email.",
        })
        setCountdown(60) 
      } else {
        toast({
          title: "Failed to resend",
          description: responseText || "Could not resend verification code.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to your email to reset your password.
          </p>
          <p className="text-xs text-muted-foreground">Password Reset Verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="verificationCode"
            placeholder="Enter 6-digit code"
            value={formData.verificationCode}
            onChange={handleInputChange}
            className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            maxLength={6}
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
        </Button>
      </form>

      <div className="text-center space-y-3">
        <p className="text-xs text-muted-foreground">Didn't receive the code?</p>
        <Button
          variant="outline"
          onClick={handleResendCode}
          disabled={isResending || countdown > 0}
          className="w-full h-11"
        >
          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
        </Button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-32">
          <p className="font-semibold mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}

      <div className="text-center">
        <Button variant="ghost" asChild className="h-auto p-0">
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to forgot password
          </Link>
        </Button>
      </div>
    </div>
  )
}
