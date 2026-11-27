import type React from "react"
import type { Metadata } from "next"
import { Figtree, Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { AuthProvider } from "@/features/auth/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" })
const figtree = Figtree({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"], variable: "--font-display" })

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common")
  return {
    title: `${t("appName")} - ${t("appTagline")}`,
    description: t("appDescription"),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${figtree.variable} font-sans`}>
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
