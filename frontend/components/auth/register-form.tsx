"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react"
import { FormError } from "@/components/ui/form-error"
import { FieldError } from "@/components/ui/field-error"
import { toast } from "@/hooks/use-toast"
import { apiUrl } from "@/lib/config"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }

    if (formError) {
      setFormError("")
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.username) {
      errors.username = "Username is required"
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters long"
    } else if (formData.username.length > 20) {
      errors.username = "Username must be no more than 20 characters long"
    }

    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

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
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }

      const response = await fetch(apiUrl("/auth/register"), {
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
        toast({
          variant: "success",
          title: "Account created!",
          description: "Please check your email for verification code.",
        })

        sessionStorage.setItem("pendingVerificationEmail", formData.email)

        router.push("/verify")
      } else {
        const errorMessage = parseBackendError(responseText)
        setFormError(errorMessage)
      }
    } catch (error: any) {
      setFormError("Unable to create account. Please check your connection and try again.")
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
        {formError && <FormError message={formError} />}

        <div className="space-y-1">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="username"
              type="text"
              placeholder="Username (3-20 characters)"
              value={formData.username}
              onChange={handleInputChange}
              className={`pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary ${
                fieldErrors.username ? "border-red-500 focus:border-red-500" : ""
              }`}
              required
            />
          </div>
          <FieldError message={fieldErrors.username} />
        </div>

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

        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password (8+ chars, include letters & numbers)"
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
    </div>
  )
}
