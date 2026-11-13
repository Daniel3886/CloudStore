import type React from "react"
import { renderHook } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import messages from "@/messages/en"

function IntlWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}

export function renderHookWithIntl<Result>(hook: () => Result) {
  return renderHook(hook, { wrapper: IntlWrapper })
}
