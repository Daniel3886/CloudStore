"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/components/auth-provider"
import { LandingPage } from "@/features/landing/components/landing-page"

export default function HomePage() {
  const { isAuthenticated, isLoading, profileUnavailable } = useAuth()
  const router = useRouter()
  const signedIn = isAuthenticated || profileUnavailable

  useEffect(() => {
    if (!isLoading && signedIn) router.replace("/files")
  }, [isLoading, signedIn, router])

  if (isLoading || signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    )
  }

  return <LandingPage />
}
