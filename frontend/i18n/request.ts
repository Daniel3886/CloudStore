import { cookies, headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/i18n/config"

async function resolveLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(localeCookieName)?.value
  if (isLocale(cookieLocale)) return cookieLocale

  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  for (const part of acceptLanguage.split(",")) {
    const language = part.split(";")[0]?.trim().split("-")[0]
    if (isLocale(language)) return language
  }
  return defaultLocale
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale()
  const messages = (await import(`../messages/${locale}/index.ts`)).default
  return { locale, messages }
})
