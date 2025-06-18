// Make sure the file exists at the correct path, or update the import path if necessary
import { VerifyForm } from "@/components/auth/verify-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="size-12 rounded-md bg-primary text-primary-foreground grid place-items-center text-xl font-bold">
            CS
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">Enter the verification code sent to your email</CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyForm />
      </CardContent>
    </Card>
  )
}
