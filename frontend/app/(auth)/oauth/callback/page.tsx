"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token")
      const email = searchParams.get("email")
      const error = searchParams.get("error")

      if (error) {
        toast({
          title: "Authentication failed",
          description: error,
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      if (token && email) {
        login(token, email)
        toast({
          title: "Welcome!",
          description: "You have been successfully logged in.",
        })
        router.push("/files")
      } else {
        toast({
          title: "Authentication failed",
          description: "Invalid callback parameters",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    handleOAuthCallback()
  }, [searchParams, login, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <div className="size-16 rounded-md bg-primary text-primary-foreground grid place-items-center text-2xl font-bold mx-auto">
          CS
        </div>
        <h1 className="text-2xl font-bold">CloudStore</h1>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    </div>
  )
}
