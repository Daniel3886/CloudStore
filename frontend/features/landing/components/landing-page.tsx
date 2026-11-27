"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { CopyCommand } from "@/features/landing/components/copy-command"
import { LinkCountdownCard } from "@/features/landing/components/link-countdown"
import { ProductPreview } from "@/features/landing/components/product-preview"

const REPO_URL = "https://github.com/Daniel3886/CloudStore"
const SAMPLE_LINK_REMAINING_MS = (17 * 60 + 42) * 60_000

const FEATURES = ["upload", "share", "links", "trash", "activity"] as const
const FEATURE_FACTS = {
  upload: ["features.upload.limit", "features.upload.languages"],
  share: [],
  links: ["features.links.fact"],
  trash: ["features.trash.fact"],
  activity: [],
} as const
const BUILT = [
  ["api", "backend/…/file/service/"],
  ["auth", "backend/…/auth/filter/JwtFilter.java"],
  ["links", "backend/…/publicsharing/service/PublicFileSharingService.java"],
  ["cleanup", "backend/…/file/service/AutoCleanupService.java"],
  ["storage", "backend/src/main/resources/application.properties"],
  ["frontend", "frontend/lib/api/client.ts"],
  ["ci", ".github/workflows/frontend.yml"],
] as const

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5 font-display text-lg font-bold">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">
        CS
      </span>
      CloudStore
    </span>
  )
}

export function LandingPage() {
  const t = useTranslations("landing")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link href="/" aria-label="CloudStore">
            <Logo />
          </Link>
          <nav aria-label={t("nav.label")} className="hidden gap-5 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              {t("nav.features")}
            </a>
            <a href="#built" className="hover:text-foreground">
              {t("nav.built")}
            </a>
            <a href="#self-host" className="hover:text-foreground">
              {t("nav.selfHost")}
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <a href={REPO_URL} aria-label={t("nav.github")}>
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">{t("nav.signIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">{t("nav.signUp")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-16 text-center md:pt-24">
          <h1 className="mx-auto max-w-[14ch] text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] md:text-7xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-lg text-muted-foreground">{t("hero.lede")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">{t("hero.primary")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#self-host">{t("hero.secondary")}</a>
            </Button>
          </div>
          <CopyCommand command="docker compose up -d" className="mt-6" />
          <p className="mt-3 text-sm text-muted-foreground">{t("hero.licence")}</p>

          <div className="relative mx-auto mt-14 max-w-5xl text-left">
            <div
              role="img"
              aria-label={t("hero.previewLabel")}
              className="overflow-hidden rounded-2xl border bg-card/60 shadow-2xl shadow-black/40"
            >
              <div className="flex h-10 items-center gap-3 border-b bg-card px-4" aria-hidden>
                <span className="flex gap-1.5">
                  <i className="size-2.5 rounded-full bg-muted" />
                  <i className="size-2.5 rounded-full bg-muted" />
                  <i className="size-2.5 rounded-full bg-muted" />
                </span>
                <span className="mx-auto max-w-xs flex-1 truncate rounded-md bg-background px-3 py-1 text-center font-mono text-xs text-muted-foreground">
                  files.your-server.home/files
                </span>
              </div>
              <ProductPreview linkHoursLeft={17} />
            </div>
            <LinkCountdownCard
              remainingMs={SAMPLE_LINK_REMAINING_MS}
              className="relative mx-3 -mt-8 md:absolute md:-right-6 md:bottom-12 md:mx-0 md:mt-0 md:w-80"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t("hero.sample")}</p>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-28">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">{t("features.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("features.lede")}</p>
          </div>
          <div className="mt-6 divide-y">
            {FEATURES.map((key) => (
              <div key={key} className="grid gap-3 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-16">
                <h3 className="text-2xl font-bold">{t(`features.${key}.title`)}</h3>
                <div className="space-y-4">
                  <p className="max-w-[60ch] text-muted-foreground">{t(`features.${key}.body`)}</p>
                  {FEATURE_FACTS[key].length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {FEATURE_FACTS[key].map((fact) => (
                        <span key={fact} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
                          {t(fact)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="built" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-extrabold md:text-4xl">{t("built.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("built.lede")}</p>
          </div>
          <dl className="mt-10 border-t">
            {BUILT.map(([key, path]) => (
              <div key={key} className="grid gap-1.5 border-b py-5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
                <dt className="font-display text-lg font-bold">{t(`built.${key}.term`)}</dt>
                <dd className="grid gap-1.5 text-muted-foreground">
                  {t(`built.${key}.detail`)}
                  <code className="break-all font-mono text-xs">{path}</code>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="self-host" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-extrabold md:text-4xl">{t("selfHost.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("selfHost.lede")}</p>
          </div>
          <ol className="ml-4 mt-10 border-l">
            {[
              {
                title: t("selfHost.step1"),
                code: "git clone https://github.com/Daniel3886/CloudStore.git\ncd CloudStore",
              },
              { title: t("selfHost.step2"), body: t("selfHost.step2Body") },
              { title: t("selfHost.step3"), code: "docker compose up -d" },
            ].map((step, index) => (
              <li key={step.title} className="relative min-w-0 pb-10 pl-10 last:pb-0">
                <span className="absolute -left-4 top-0 grid size-8 place-items-center rounded-full border bg-background font-display text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <h3 className="pt-1 text-lg font-bold">{step.title}</h3>
                {step.body && <p className="mt-2 max-w-[60ch] text-muted-foreground">{step.body}</p>}
                {step.code && (
                  <pre className="mt-3 max-w-3xl overflow-x-auto rounded-xl border bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-200">
                    {step.code
                      .split("\n")
                      .map((line) => `$ ${line}`)
                      .join("\n")}
                  </pre>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-28 border-t bg-card/40 px-5 py-20 text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">{t("close.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("close.body")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">{t("hero.primary")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={REPO_URL}>
                <Github className="h-4 w-4 mr-2" />
                {t("close.github")}
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Logo /> · {t("footer.licence")}
          </span>
          <nav aria-label={t("footer.label")} className="flex gap-5">
            <a href="#features" className="hover:text-foreground">
              {t("nav.features")}
            </a>
            <a href="#self-host" className="hover:text-foreground">
              {t("nav.selfHost")}
            </a>
            <a href={REPO_URL} className="hover:text-foreground">
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
