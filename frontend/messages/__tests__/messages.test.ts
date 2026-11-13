import { describe, expect, it } from "vitest"
import { TYPE, parse, type MessageFormatElement } from "@formatjs/icu-messageformat-parser"
import { createTranslator } from "next-intl"
import en from "@/messages/en"
import pl from "@/messages/pl"
import { locales } from "@/i18n/config"

type Tree = { [key: string]: string | Tree }

const catalogs: Record<string, Tree> = { en, pl }

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) }
  }, {})
}

function collectArguments(elements: MessageFormatElement[], names = new Set<string>()): Set<string> {
  for (const element of elements) {
    if (element.type === TYPE.literal || element.type === TYPE.pound) continue
    names.add(element.value)
    if (element.type === TYPE.plural || element.type === TYPE.select) {
      Object.values(element.options).forEach((option) => collectArguments(option.value, names))
    }
    if (element.type === TYPE.tag) collectArguments(element.children, names)
  }
  return names
}

function pluralElements(elements: MessageFormatElement[]): { value: string; options: string[] }[] {
  return elements.flatMap((element) => {
    if (element.type === TYPE.plural) {
      const nested = Object.values(element.options).flatMap((option) => pluralElements(option.value))
      return [{ value: element.value, options: Object.keys(element.options) }, ...nested]
    }
    if (element.type === TYPE.select) return Object.values(element.options).flatMap((o) => pluralElements(o.value))
    if (element.type === TYPE.tag) return pluralElements(element.children)
    return []
  })
}

const reference = flatten(en)

describe("message catalogs", () => {
  it("has a catalog for every configured locale", () => {
    expect(Object.keys(catalogs).sort()).toEqual([...locales].sort())
  })

  it.each(Object.keys(catalogs).filter((locale) => locale !== "en"))("%s has exactly the English keys", (locale) => {
    expect(Object.keys(flatten(catalogs[locale])).sort()).toEqual(Object.keys(reference).sort())
  })

  it.each(Object.keys(catalogs))("%s messages are valid ICU and use the same arguments as English", (locale) => {
    for (const [key, message] of Object.entries(flatten(catalogs[locale]))) {
      const expected = collectArguments(parse(reference[key]))
      expect(collectArguments(parse(message)), `${locale}: ${key}`).toEqual(expected)
    }
  })

  it("Polish plurals cover the one, few and many forms", () => {
    for (const [key, message] of Object.entries(flatten(pl))) {
      for (const plural of pluralElements(parse(message))) {
        const exactOnly = plural.options.every((option) => option.startsWith("=") || option === "other")
        if (exactOnly) continue
        expect(plural.options, `pl: ${key}`).toEqual(expect.arrayContaining(["one", "few", "many", "other"]))
      }
    }
  })

  it("formats Polish plurals correctly", () => {
    const t = createTranslator({ locale: "pl", messages: pl, namespace: "files.upload" })
    expect(t("selected", { count: 1 })).toBe("Wybrano 1 plik")
    expect(t("selected", { count: 3 })).toBe("Wybrano 3 pliki")
    expect(t("selected", { count: 5 })).toBe("Wybrano 5 plików")
    expect(t("selected", { count: 22 })).toBe("Wybrano 22 pliki")
    expect(t("selected", { count: 112 })).toBe("Wybrano 112 plików")
  })
})
