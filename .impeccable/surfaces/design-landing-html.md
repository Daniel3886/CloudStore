---
version: 1
slug: "design-landing-html"
primary_target: "design/landing.html"
related_targets: []
---

# Landing page

Scope: CloudStore public landing page (route `/` once implemented). Mode: Persuade.
Audience: self-hosters deciding whether to run it; recruiters judging how it was built. Action: copy the install command and self-host; on an instance, create an account. Proof: the working product itself, shown as faithful UI with sample data, and real facts from the repo. Constraints: no demo instance yet, no invented users, stats or claims. Dark by default on every page (user requirement); light only when the visitor switches.

## Direction contract

THESIS: Your files on your own server and bucket, shown by the product working, not by adjectives. Refuses the gradient-blob SaaS hero with a stock illustration.
OWN-WORLD: The app's own system carried to the landing: graphite-navy ground, the app's blue primary (#2563eb family) as the one accent, the CS tile as mark, Figtree headings and Inter body, rounded product frames with real UI inside. Amber only for things that expire.
STORY: The visitor learns what CloudStore is in one line, sees the file browser and a 24-hour link working, sees sharing, Trash and Activity, sees how it is built, then copies the compose command or creates an account.
FIRST VIEWPORT: Centred headline and one-line subcopy at top; two actions (Create an account, Self-host it) and a copyable `docker compose up -d` command under them; a large framed My files screen below, starting inside the fold, with a public-link card overlapping its right edge.
FORM: Category standard (canon), chosen by the user; craft bar Immich. seed:25c0186a67a70664
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
