"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Shield, ArrowLeft } from "lucide-react"

export function VerifyForm() {
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
    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail")
    if (pendingEmail) {
      setFormData((prev) => ({ ...prev, email: pendingEmail }))
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
      setDebugInfo("Sending verification request...")

      const requestBody = {
        email: formData.email,
        verificationCode: formData.verificationCode,
      }

      setDebugInfo(
        (prev) =>
          `${prev}\nSending request to: http://localhost:8080/auth/verify\nPayload: ${JSON.stringify(requestBody)}`,
      )

      const response = await fetch("http://localhost:8080/auth/verify", {
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
        const tokenMatch = responseText.match(/Token:\s*(.+)/)
        const token = tokenMatch ? tokenMatch[1].trim() : responseText

        localStorage.setItem("authToken", token)
        localStorage.setItem("userEmail", formData.email)

        sessionStorage.removeItem("pendingVerificationEmail")

        setDebugInfo((prev) => `${prev}\nVerification successful!`)
        toast({
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        })

        router.push("/files")
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
      const response = await fetch("http://localhost:8080/auth/resend-verification", {
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
          <p className="text-sm text-muted-foreground">We send a verification code to your email address.</p>
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
            placeholder="Enter verification code"
            value={formData.verificationCode}
            onChange={handleInputChange}
            className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            maxLength={6}
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
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
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to login
          </Link>
        </Button>
      </div>
    </div>
  )
}
