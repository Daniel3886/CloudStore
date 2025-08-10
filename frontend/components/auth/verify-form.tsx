"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, Shield, ArrowLeft } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { FieldError } from "@/components/ui/field-error"
import { toast } from "@/hooks/use-toast"

export function VerifyForm() {
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const router = useRouter()

  useEffect(() => {
    const registrationEmail = sessionStorage.getItem("pendingVerificationEmail")
    if (registrationEmail) {
      setFormData((prev) => ({ ...prev, email: registrationEmail }))
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Clear form error when user starts typing
    if (formError) {
      setFormError("")
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.verificationCode) {
      errors.verificationCode = "Verification code is required"
    } else if (formData.verificationCode.length !== 6) {
      errors.verificationCode = "Verification code must be 6 digits"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const parseBackendError = (responseText: string) => {
    try {
      const errorData = JSON.parse(responseText)
      return errorData.message || errorData.error || responseText
    } catch {
      return responseText.trim() || "An unexpected error occurred"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const requestBody = {
        email: formData.email,
        verificationCode: formData.verificationCode,
      }

      const response = await fetch("http://localhost:8080/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "include",
      })

      const responseText = await response.text()

      if (response.ok) {
        const tokenMatch = responseText.match(/Token:\s*(.+)/)
        const token = tokenMatch ? tokenMatch[1].trim() : responseText.trim()

        localStorage.setItem("accessToken", token)
        localStorage.setItem("userEmail", formData.email)

        sessionStorage.removeItem("pendingVerificationEmail")

        toast({
          variant: "success",
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        })

        router.push("/files")
      } else {
        const errorMessage = parseBackendError(responseText)
        setFormError(errorMessage)
      }
    } catch (error: any) {
      setFormError("Unable to verify code. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      const response = await fetch("http://localhost:8080/resend-verification", {
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
          variant: "success",
          title: "Code sent!",
          description: "A new verification code has been sent to your email.",
        })
        setCountdown(60)
      } else {
        const errorMessage = parseBackendError(responseText)
        setFormError(errorMessage)
      }
    } catch (error: any) {
      setFormError("Unable to resend code. Please check your connection and try again.")
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
          <p className="text-sm text-muted-foreground">We sent a verification code to your email address.</p>
          {formData.email && <p className="text-sm font-medium break-all">{formData.email}</p>}
          <p className="text-xs text-muted-foreground">Registration Verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <FormError message={formError} />}

        {!formData.email && (
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                  fieldErrors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
                required
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>
        )}

        <div className="space-y-1">
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="verificationCode"
              placeholder="Enter 6-digit code"
              value={formData.verificationCode}
              onChange={handleInputChange}
              className={`pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary text-center tracking-widest ${
                fieldErrors.verificationCode ? "border-red-500 focus:border-red-500" : ""
              }`}
              maxLength={6}
              required
            />
          </div>
          <FieldError message={fieldErrors.verificationCode} />
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
