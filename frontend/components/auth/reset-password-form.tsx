"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, Lock, ArrowLeft, CheckCircle } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { FieldError } from "@/components/ui/field-error"
import { toast } from "@/hooks/use-toast"

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
  const [resetSuccess, setResetSuccess] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const router = useRouter()

  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem("verifiedResetEmail")

    if (verifiedEmail) {
      setEmail(verifiedEmail)
      setIsValidSession(true)
    } else {
      setFormError("Invalid session. Please start the password reset process from the beginning.")
    }
  }, [])

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

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long"
    } else if (formData.password.length > 128) {
      errors.password = "Password must be no more than 128 characters long"
    } else if (!/\d/.test(formData.password)) {
      errors.password = "Password must contain at least one number"
    } else if (!/[a-zA-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one letter"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
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
        email,
        newPassword: formData.password,
      }

      const response = await fetch("http://localhost:8080/reset-password", {
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
        setResetSuccess(true)

        sessionStorage.removeItem("verifiedResetEmail")

        toast({
          variant: "success",
          title: "Password reset successful!",
          description: "Your password has been updated. You can now sign in with your new password.",
        })

        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        const errorMessage = parseBackendError(responseText)
        setFormError(errorMessage)
      }
    } catch (error: any) {
      setFormError("Unable to reset password. Please check your connection and try again.")
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
        {formError && <FormError message={formError} />}

        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="New password (8+ chars, include letters & numbers)"
              value={formData.password}
              onChange={handleInputChange}
              className={`pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                fieldErrors.password ? "border-red-500 focus:border-red-500" : ""
              }`}
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
          <FieldError message={fieldErrors.password} />
        </div>

        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500" : ""
              }`}
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
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>At least 8 characters long</li>
            <li>Contains at least one letter</li>
            <li>Contains at least one number</li>
            <li>Both passwords must match</li>
          </ul>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
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
