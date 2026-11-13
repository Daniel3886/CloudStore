export const locales = ["en", "pl"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
export const localeCookieName = "NEXT_LOCALE"

export const localeLabels: Record<Locale, string> = {
  en: "English",
  pl: "Polski",
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}
