import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="size-12 rounded-md bg-primary text-primary-foreground grid place-items-center text-xl font-bold">
            CS
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Set new password</CardTitle>
        <CardDescription className="text-center">Choose a strong password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  )
}
