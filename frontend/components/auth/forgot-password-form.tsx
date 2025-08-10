"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { FieldError } from "@/components/ui/field-error"
import { toast } from "@/hooks/use-toast"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldError, setFieldError] = useState("")

  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (fieldError) setFieldError("")
    if (formError) setFormError("")
  }

  const validateForm = () => {
    if (!email) {
      setFieldError("Email is required")
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please enter a valid email address")
      return false
    }

    return true
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
      const response = await fetch("http://localhost:8080/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
        mode: "cors",
        credentials: "include",
      })

      const responseText = await response.text()

      if (response.ok) {
        setEmailSent(true)

        sessionStorage.setItem("passwordResetEmail", email)
        sessionStorage.setItem("resetFlowActive", "true")

        toast({
          variant: "success",
          title: "Verification code sent!",
          description: "Check your email for the 6-digit verification code.",
        })

        setTimeout(() => {
          router.push("/verify-password")
        }, 2000)
      } else {
        const errorMessage = parseBackendError(responseText)
        setFormError(errorMessage)
      }
    } catch (error: any) {
      setFormError("Unable to send verification code. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">We've sent a 6-digit verification code to</p>
          <p className="text-sm font-medium break-all">{email}</p>
          <p className="text-xs text-muted-foreground mt-2">
            You'll be redirected to enter the verification code shortly...
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => router.push("/verify-password")} className="w-full h-11">
            Continue to verification
          </Button>
          <Button variant="outline" onClick={() => setEmailSent(false)} className="w-full h-11">
            Try another email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Enter your email address and we'll send you a 6-digit verification code to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <FormError message={formError} />}

        <div className="space-y-1">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={handleInputChange}
              className={`pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                fieldError ? "border-red-500 focus:border-red-500" : ""
              }`}
              required
            />
          </div>
          <FieldError message={fieldError} />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send verification code
        </Button>
      </form>

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
