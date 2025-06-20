"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

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
      setDebugInfo("Sending login request...")

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

      setDebugInfo((prev) => `${prev}\nResponse status: ${response.status}`)

      const responseText = await response.text()
      setDebugInfo((prev) => `${prev}\nResponse: ${responseText}`)

      if (response.ok) {
        const tokenMatch = responseText.match(/Token:\s*(.+)/)
        const token = tokenMatch ? tokenMatch[1].trim() : responseText.trim()

        localStorage.setItem("authToken", token)
        localStorage.setItem("userEmail", formData.email)

        toast({
          title: "Login successful!",
          description: "Welcome back to CloudStore.",
        })

        router.push("/files")
      } else {
        throw new Error(responseText || "Login failed")
      }
    } catch (error: any) {
      setDebugInfo((prev) => `${prev}\nError: ${error.message}`)
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Enter your email and password to access your CloudStore account.
      </p>

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
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10 h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
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

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log in
        </Button>

        <div className="flex items-center justify-between pt-2">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
          <Link href="/register" className="text-sm text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </form>

      {debugInfo && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
          <p className="font-semibold mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}
    </div>
  )
}
