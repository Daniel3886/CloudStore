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

export function VerifyForm() {
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get email from session storage (set during registration)
    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail")
    if (pendingEmail) {
      setFormData((prev) => ({ ...prev, email: pendingEmail }))
    }
  }, [])

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
        // Extract token from response (assuming it's in format "Verification successful. Token: {token}")
        const tokenMatch = responseText.match(/Token:\s*(.+)/)
        const token = tokenMatch ? tokenMatch[1].trim() : responseText

        // Store token
        localStorage.setItem("authToken", token)
        localStorage.setItem("userEmail", formData.email)

        // Clear pending verification email
        sessionStorage.removeItem("pendingVerificationEmail")

        setDebugInfo((prev) => `${prev}\nVerification successful!`)
        toast({
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        })

        // Redirect to main dashboard
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>

      {formData.email && (
        <p className="text-center text-sm text-muted-foreground">
          We sent a verification code to <strong>{formData.email}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!formData.email && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="verificationCode">Verification Code</Label>
          <Input
            id="verificationCode"
            name="verificationCode"
            placeholder="Enter verification code"
            value={formData.verificationCode}
            onChange={handleInputChange}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>
      </form>

      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
          <p className="font-semibold mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}

      <div className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  )
}
