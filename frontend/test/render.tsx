import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { Locale } from "@/i18n/config"
import en from "@/messages/en"
import pl from "@/messages/pl"

const catalogs = { en, pl } satisfies Record<Locale, typeof en>

interface IntlRenderOptions extends Omit<RenderOptions, "wrapper"> {
  locale?: Locale
}

export function renderWithIntl(ui: React.ReactElement, { locale = "en", ...options }: IntlRenderOptions = {}) {
  function IntlWrapper({ children }: { children: React.ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    )
  }
  return render(ui, { wrapper: IntlWrapper, ...options })
}
