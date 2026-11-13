"use server"

import { cookies } from "next/headers"
import { isLocale, localeCookieName } from "@/i18n/config"

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export async function setUserLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) {
    throw new Error(`Unsupported locale: ${locale}`)
  }
  ;(await cookies()).set(localeCookieName, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  })
}
