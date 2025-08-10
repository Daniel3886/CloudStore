"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import { useAuth } from "./auth-provider"
import { FormError } from "@/components/ui/form-error"
import { FieldError } from "@/components/ui/field-error"
import { toast } from "@/hooks/use-toast"

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const { login } = useAuth()

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

    if (!formData.password) {
      errors.password = "Password is required"
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
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        mode: "cors",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()

        if (data.accessToken && data.refreshToken) {
          login(data.accessToken, data.refreshToken, formData.email)

          toast({
            variant: "success",
            title: "Welcome back!",
            description: "You've been successfully signed in.",
          })

          router.push("/files")
        } else {
          throw new Error("Invalid response format from server")
        }
      } else {
        const errorText = await response.text()
        const errorMessage = parseBackendError(errorText)
        setFormError(errorMessage)
      }
    } catch (error: any) {
      setFormError(error.message || "Unable to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Sign in to your CloudStore account to access your files.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <FormError message={formError} />}

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
              placeholder="Password"
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

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>

        <div className="text-center pt-2">
          <span className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </div>
  )
}
