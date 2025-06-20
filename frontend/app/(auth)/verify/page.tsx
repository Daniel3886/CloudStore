import { VerifyForm } from "@/components/auth/verify-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="size-16 rounded-xl bg-primary text-primary-foreground grid place-items-center text-2xl font-bold">
              CS
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">CloudStore</h1>
            <p className="text-muted-foreground">Secure File Storage</p>
          </div>
        </div>

        <Card className="border-muted-foreground/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold text-center">Verify your email</h2>
          </CardHeader>
          <CardContent>
            <VerifyForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
