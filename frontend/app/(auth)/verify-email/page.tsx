import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="size-12 rounded-md bg-primary text-primary-foreground grid place-items-center text-xl font-bold">
            CS
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">We've sent a verification code to your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <EmailVerificationForm />
      </CardContent>
    </Card>
  )
}
