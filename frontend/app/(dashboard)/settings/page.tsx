"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { User, Shield, Trash2, Loader2, Settings, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"


async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  const accessToken = localStorage.getItem("accessToken")
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`

  return fetch(url, { ...options, headers, credentials: "include" })
}

export default function SettingsPage() {
  const { user, loadUserProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [deletePassword, setDeletePassword] = useState("")
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  useEffect(() => {
    const init = async () => {
      await loadUserProfile()
      setIsLoading(false)
    }
    init()
  }, [loadUserProfile])

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all password fields" })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "New password and confirmation must match" })
      return
    }

    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Password must be at least 8 characters long" })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await makeAuthenticatedRequest("http://localhost:8080/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) throw new Error(await response.text())

      toast({ title: "Password changed", description: "Your password has been updated successfully" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to change password", description: err.message || "Could not change your password" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ variant: "destructive", title: "Password required", description: "Please enter your password to confirm account deletion" })
      return
    }

    if (!user?.email) {
      toast({ variant: "destructive", title: "Error", description: "Unable to determine user email" })
      return
    }

    setIsDeletingAccount(true)
    try {
      const response = await makeAuthenticatedRequest("http://localhost:8080/auth/delete-account", {
        method: "DELETE",
        body: JSON.stringify({ email: user.email, password: deletePassword }),
      })

      if (!response.ok) throw new Error(await response.text())

      toast({ title: "Account deleted", description: "Your account has been permanently deleted" })
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/login"
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete account", description: err.message || "Could not delete your account" })
    } finally {
      setIsDeletingAccount(false)
      setDeleteDialogOpen(false)
      setDeletePassword("")
      setShowDeletePassword(false)
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
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={user?.username || ""} disabled className="bg-muted" />
          </div>
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
            <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter your current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter your new password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" />
          </div>
          <Button onClick={handlePasswordChange} disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
            {isChangingPassword ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Changing Password...</> : "Change Password"}
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
          <h4 className="font-medium">Delete Account</h4>
          <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Separator />
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={open => { setDeleteDialogOpen(open); if (!open) { setDeletePassword(""); setShowDeletePassword(false); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" /> Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              <p><strong>This action cannot be undone.</strong> Enter your password to confirm deletion:</p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="delete-password" className="sr-only">Password</Label>
            <div className="relative">
              <Input id="delete-password" type={showDeletePassword ? "text" : "password"} value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Enter your password to confirm" className="w-full pr-10" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowDeletePassword(!showDeletePassword)}>
                {showDeletePassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                <span className="sr-only">{showDeletePassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword}
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
  );
}
