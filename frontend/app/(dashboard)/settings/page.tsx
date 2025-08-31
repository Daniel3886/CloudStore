"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { User, Mail, Shield, Trash2, CheckCircle, XCircle, Loader2, Settings, AlertTriangle } from "lucide-react"

interface UserProfile {
  email: string
  username?: string
  isEmailVerified: boolean
  createdAt?: string
}

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  const accessToken = localStorage.getItem("accessToken")
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await makeAuthenticatedRequest("http://localhost:8080/auth/profile")

      if (!response.ok) {
        throw new Error("Failed to load profile")
      }

      const profile = await response.json()
      setUserProfile(profile)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load profile",
        description: error.message || "Could not load your profile information",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all password fields",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters long",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await makeAuthenticatedRequest("http://localhost:8080/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to change password")
      }

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to change password",
        description: error.message || "Could not change your password",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleResendVerification = async () => {
    if (!userProfile?.email) return

    try {
      const response = await makeAuthenticatedRequest("http://localhost:8080/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({
          email: userProfile.email,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to resend verification")
      }

      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send verification",
        description: error.message || "Could not send verification email",
      })
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      const response = await makeAuthenticatedRequest("http://localhost:8080/auth/delete-account", {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to delete account")
      }

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      })

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/login"
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete account",
        description: error.message || "Could not delete your account",
      })
    } finally {
      setIsDeletingAccount(false)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input value={userProfile?.email || ""} disabled className="bg-muted" />
              {userProfile?.isEmailVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          {userProfile?.username && (
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={userProfile.username} disabled className="bg-muted" />
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>

          <Separator />

          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <strong>This action cannot be undone.</strong> This will permanently delete your account and remove all
                associated data including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your uploaded files</li>
                <li>Shared file permissions</li>
                <li>Account information</li>
                <li>File sharing history</li>
              </ul>
              <p className="font-medium">Are you absolutely sure you want to delete your account?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
