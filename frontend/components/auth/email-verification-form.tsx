"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail } from "lucide-react"

export function EmailVerificationForm() {
  const [verificationCode, setVerificationCode] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail")
    if (pendingEmail) {
      setEmail(pendingEmail)
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {

      const response = await fetch("http://localhost:8080/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        })

        sessionStorage.removeItem("pendingVerificationEmail")

        if (data.token) {
          sessionStorage.setItem("token", data.token)
          router.push("/files")
        } else {
          router.push("/login")
        }
      } else {
        toast({
          title: "Verification failed",
          description: data.message || "Invalid verification code.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Code sent!",
          description: "A new verification code has been sent to your email.",
        })
        setCountdown(60) 
      } else {
        toast({
          title: "Failed to resend",
          description: data.message || "Could not resend verification code.",
          variant: "destructive",
        })
      }
    } catch (error) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>

      {email && (
        <p className="text-center text-sm text-muted-foreground">
          We sent a verification code to <strong>{email}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!email && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify email
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
        <Button variant="outline" onClick={handleResendCode} disabled={isResending || countdown > 0} className="w-full">
          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
        </Button>
      </div>

      <div className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  )
}
