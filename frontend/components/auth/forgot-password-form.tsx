"use client"


// TODO: When you create a forgot password endpoint choose between reset-password or forgot-password
//Here it ask for an email to send a reset link

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo(null)

    try {
      setDebugInfo("Sending forgot password request...")

      //POST request to send reset email
      // Resend email verification code
      const response = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
        mode: "cors",
        credentials: "include",
      })

      setDebugInfo((prev) => `${prev}\nResponse status: ${response.status}`)

      const responseText = await response.text()
      setDebugInfo((prev) => `${prev}\nResponse: ${responseText}`)

      if (response.ok) {
        setEmailSent(true)
        setDebugInfo((prev) => `${prev}\nReset email sent successfully!`)
        toast({
          title: "Reset link sent!",
          description: "Check your email for password reset instructions.",
        })
      } else {
        const errorMsg = responseText || "Failed to send reset email"
        setDebugInfo((prev) => `${prev}\nFailed: ${errorMsg}`)
        toast({
          title: "Failed to send reset link",
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
          <p className="text-sm text-muted-foreground">We've sent password reset instructions to</p>
          <p className="text-sm font-medium break-all">{email}</p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Didn't receive the email? Check your spam folder or try again.
        </p>

        <div className="space-y-3">
          <Button variant="outline" onClick={() => setEmailSent(false)} className="w-full h-11">
            Try another email
          </Button>
          <Button variant="ghost" asChild className="w-full h-11">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-32">
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
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
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
