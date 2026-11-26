---
name: CloudStore
description: Self-hosted file storage and sharing, shown by the product working.
colors:
  background: "#020817"
  background-raised: "#060e1f"
  surface: "#0b1426"
  raised: "#1e293b"
  border: "#1e293b"
  border-soft: "#152036"
  foreground: "#f8fafc"
  muted-foreground: "#94a3b8"
  faint: "#8492a8"
  primary: "#3b82f6"
  primary-hover: "#60a5fa"
  primary-foreground: "#0f172a"
  link: "#60a5fa"
  expiry-amber: "#fbbf24"
  success-green: "#4ade80"
  code-background: "#060b17"
  terminal-ink: "#d7e2f5"
  terminal-prompt: "#7cb0ff"
  terminal-comment: "#6f809e"
typography:
  display:
    fontFamily: "Figtree, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 4.6rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Figtree, Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.8rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 1.9rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
rounded:
  sm: "6px"
  control: "8px"
  button: "9px"
  md: "10px"
  card: "14px"
  lg: "16px"
  full: "99px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "22px"
  lg: "32px"
  gutter: "20px"
  block: "64px"
  section: "120px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-quiet-hover:
    backgroundColor: "{colors.raised}"
  button-sm:
    padding: "8px 12px"
    rounded: "{rounded.button}"
  input:
    backgroundColor: "{colors.background-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 12px"
  nav-item-active:
    backgroundColor: "rgb(59 130 246 / .14)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  pill:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "3px 9px"
  pill-expiry:
    backgroundColor: "rgb(251 191 36 / .13)"
    textColor: "{colors.expiry-amber}"
    rounded: "{rounded.full}"
    padding: "3px 9px"
  fact-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    padding: "5px 11px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "22px"
  product-frame:
    backgroundColor: "{colors.background-raised}"
    rounded: "{rounded.lg}"
  command-bar:
    backgroundColor: "{colors.code-background}"
    textColor: "{colors.terminal-ink}"
    rounded: "{rounded.md}"
    padding: "6px 6px 6px 16px"
  mark-tile:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.control}"
    size: "30px"
---

# Design System: CloudStore

## Overview

**Creative North Star: "The Product Is the Pitch"**

CloudStore's visual system is the app's own shadcn token set (`frontend/app/globals.css`), carried unchanged in spirit onto the public landing page. The landing page doesn't sell with illustration or adjectives. It shows the file browser, a public link counting down, sharing, Trash and Activity as faithful UI with sample data, and lets the working product make the case. It sits in the category standard for self-hosted open-source products, built to the craft bar of Immich: a graphite-navy ground, one blue accent, rounded product frames with real interface inside, and plain factual copy.

Dark is the default on every page. Light appears only when the visitor switches to it. In the app this is `next-themes` with `defaultTheme="dark"`, which remembers the choice; the standalone mockup in `design/landing.html` uses `cs-theme` in local storage. Both use the app's dark primary (#3b82f6). Density follows the app: compact 14px tables, 8 to 10px corners, hairline borders. The landing page adds generous section rhythm around those dense product frames.

Confirmed rejections: the gradient-blob SaaS hero with a stock illustration, and any invented users, stats, testimonials or claims.

**Key Characteristics:**
- The app's shadcn tokens are the system; the landing page shares them.
- Dark by default, light only on request.
- One accent, the app's blue primary; amber is kept for expiry.
- Proof is real UI in rounded frames, labelled as sample data.
- Figtree headings, Inter body, JetBrains Mono only for code, sizes and times.

## Colors

A cool slate-navy ground with one saturated blue, and amber held back for things that run out.

### Primary
- **Signal Blue** (`primary`): the app's dark-mode primary (shadcn `217.2 91.2% 59.8%`). Primary buttons, the CS tile, the active nav item tint, folder icons, and selected table rows (at 14% alpha). Text on it is **Deep Slate** (`primary-foreground`), never white. Hover lifts to **Sky Blue** (`primary-hover`), which also serves as the link and focus-ring color (`link`). In light mode the primary is #2563eb, the app's light primary, with white text.

### Tertiary
- **Expiry Amber** (`expiry-amber`): reserved for time running out. Public-link pills, the 24-cell hour strip and countdown on the link card, and Trash items close to their 30-day deletion. In light mode it darkens to #a35f00 for contrast. Its soft fill is amber at 13% alpha.
- **Done Green** (`success-green`): status only. "Uploaded", the Copied confirmation, and terminal check marks.

### Neutral
- **Night Navy** (`background`): the page ground, shadcn dark `--background`.
- **Raised Navy** (`background-raised`) and **Panel Navy** (`surface`): product frames, cards, tables and the closing band. Depth comes from stepping these up, not from shadows.
- **Slate Line** (`border` / `raised`): shadcn dark `--border`; hairlines, quiet-button outlines, pill fills, hover backgrounds. **Soft Line** (`border-soft`) divides rows inside cards and tables.
- **Snow** (`foreground`): primary text. **Slate Mist** (`muted-foreground`): secondary text, shadcn dark `--muted-foreground`. **Faint Slate** (`faint`): table headers, metadata, captions.
- **Terminal Night** (`code-background`) with **Terminal Ink**, **Terminal Prompt** and **Terminal Comment**: the command bar and `pre` blocks. Terminals stay dark in both themes (light-mode code background is #0f172a).

### Named Rules
**The One Accent Rule.** Blue is the only accent. It marks the primary action, the mark, the current place and selection. Nothing else on the page is blue.

**The Amber Means Expiring Rule.** Amber appears only on things that expire: public links (24 hours) and Trash (30 days). Never use it for warnings, highlights or decoration. If it doesn't run out, it isn't amber.

**The Dark First Rule.** Every page renders dark until the visitor chooses light. Author the dark values first; light is an override (`:root[data-theme="light"]`), not the base.

## Typography

**Display Font:** Figtree (with Inter, system-ui)
**Body Font:** Inter (with system-ui, -apple-system, Segoe UI)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SF Mono, Menlo)

**Character:** Figtree's round, heavy headings give the page a friendly, confident voice, and Inter keeps the product UI and body copy neutral and legible. Mono is a data face here, not a style.

### Hierarchy
- **Display** (800, `clamp(2.6rem, 6.4vw, 4.6rem)`, 1.02, -0.035em): the hero headline only, max 14ch, centred and balanced.
- **Headline** (800, `clamp(2rem, 4vw, 2.8rem)`, 1.08): section openers and the closing call.
- **Title** (700, `clamp(1.5rem, 2.6vw, 1.9rem)`, 1.15): feature headings. Smaller Figtree titles (700, 15-19px) name cards, breadcrumbs and the link card.
- **Body** (400, 16px, 1.6): copy at 46-60ch; the lede runs 1.05-1.2rem in Slate Mist at max 58ch. Product UI inside frames uses 14px.
- **Label** (500, 12px): table headers, pills and statuses. Button labels are Inter 600 at 15px (14px small).
- **Mono** (400, 12-13.5px, tabular numerals): commands, URLs, file sizes, timestamps and counts.

### Named Rules
**The Mono Is Data Rule.** JetBrains Mono is used only for code, sizes and times: commands, paths, URLs, byte sizes, timestamps, counters. Never for headings, labels or decoration.

**The Figtree Heads Rule.** Every heading and the wordmark is Figtree with tightened tracking (-0.01 to -0.035em). Body, buttons and UI text are always Inter.

## Layout

A centred single column (max 1180px, 20px gutters that respect safe-area insets). The hero is centred: headline, lede, two actions, a copyable command, then a large product frame (max 1120px) starting inside the fold, with the public-link card overlapping its right edge. Feature sections alternate copy and a UI card in a two-column grid (1fr / 1.15fr, gap `clamp(32px, 6vw, 80px)`), flipping sides each row and divided by soft hairlines. Sections open with 120px of space (88px on mobile); feature rows take 64px of block padding.

Breakpoints: at 980px the link card tucks inside the frame's lower right; at 760px everything stacks to one column, the frame drops its sidebar and extra table columns, the link card flows under the frame, and the nav keeps only the theme toggle and primary action.

## Elevation & Depth

Mostly flat, built from tonal layering: Night Navy ground, Raised and Panel Navy surfaces, Slate Line hairlines. Shadows are kept for the two objects that float above the page: the hero product frame and the public-link card. Buttons carry only a faint inner highlight.

### Shadow Vocabulary
- **Frame lift** (`0 2px 6px rgb(0 0 0 / .3), 0 30px 60px -20px rgb(0 0 0 / .65)`): the hero product frame. Light mode uses a navy-tinted, softer version.
- **Card float** (`0 2px 6px rgb(0 0 0 / .3), 0 18px 36px -12px rgb(0 0 0 / .55)`): the public-link card overlapping the frame.
- **Button bevel** (`0 1px 0 rgb(255 255 255 / .14) inset, 0 1px 2px rgb(0 0 0 / .35)`): primary buttons only.

### Named Rules
**The Only the Product Floats Rule.** Feature cards, tables and inputs sit flat on tone and hairline. Only a product frame and the overlay that sits on it get a drop shadow.

## Shapes

Softly rounded and consistent with the app's 8px shadcn radius. Controls, nav items, inputs and the CS tile use 8px; buttons use 9px; tables and the command bar use 10px; overlay cards use 14px; product frames and feature cards use 16px. Pills and fact chips are fully round. Avatars and the step markers are circles. Borders are 1px hairlines throughout; nothing uses heavy outlines.

## Components

### Buttons
Solid and quiet, nothing louder.
- **Shape:** gently rounded (9px), 1px border, no wrap.
- **Primary:** Signal Blue with Deep Slate text, 12px 18px, Inter 600 15px. Hover goes to Sky Blue.
- **Quiet:** transparent with a Slate Line border and Snow text; hover fills with Slate Line.
- **Small:** 8px 12px at 14px, used in the nav and inside product frames.
- **Motion:** background 0.18s `cubic-bezier(.16,1,.3,1)`, a 1px press on `:active`; disabled under reduced motion.
- **Focus:** 2px Sky Blue outline, 3px offset.

### Chips
- **Pill:** fully round, 3px 9px, label type, Slate Line fill, Slate Mist text. Used for access ("2 people") and "Expired".
- **Expiry pill:** amber soft fill with Expiry Amber text, optional 12px link icon. Only for live public links.
- **Fact chip:** outlined, fully round, 13px, with the key number in Snow 600 ("Up to **5 MB** per file").

### Cards / Containers
- **Product frame:** 16px radius, Raised Navy, Slate Line border, frame-lift shadow, a 40px window bar with three dots and a mono address field, and real app layout inside (200px sidebar plus main).
- **Feature card:** 16px radius, Panel Navy, Slate Line border, 22px padding, no shadow. A Figtree title row with faint metadata, then rows split by Soft Line.
- **Public-link card:** 14px radius, Slate Line fill, card-float shadow, mono URL with Copy, a 24-cell hour strip in amber, and a live countdown.

### Inputs / Fields
- **Style:** 40px tall, 8px radius, Raised Navy fill, Slate Line border, 14px text, Faint Slate placeholder.
- **Search:** 36px, Panel Navy, leading 16px icon.
- **Focus:** shared Sky Blue focus ring.

### Navigation
- **Top bar:** sticky, 64px, Night Navy at 82% with a 12px saturating blur and a Soft Line bottom border. CS tile and wordmark left; Slate Mist links (Snow on hover); theme toggle, GitHub icon button, Sign in (quiet) and Create an account (primary) right.
- **App sidebar items:** 8px radius, Slate Mist; active item uses the 14% blue tint, Snow 600 text and a Sky Blue icon; counts in mono Faint Slate.

### CS Mark
The "CS" tile is the mark: a Signal Blue rounded square (30px, 8px radius; 24px and 6px in compact spots) with "CS" in Figtree 800 in Deep Slate, followed by the Figtree 700 wordmark "CloudStore".

### Command Bar
An inline terminal pill: Terminal Night fill, Slate Line border, 10px radius, `$` in Terminal Prompt, mono command, and a ghost Copy button that turns green on success. Multi-line `pre` terminals share the palette at 12px radius.

## Do's and Don'ts

### Do:
- **Do** take colors from the app's shadcn tokens (`frontend/app/globals.css`) and keep the landing page and app on one palette.
- **Do** render dark by default on every page and switch to light only when the visitor asks.
- **Do** keep Signal Blue (#3b82f6 in dark) the only accent, with Deep Slate (#0f172a) text on it.
- **Do** use Expiry Amber only for public links (24 h) and Trash (30 days).
- **Do** show the product as faithful UI with sample data, and label it as sample data.
- **Do** set code, sizes, URLs and times in JetBrains Mono with tabular numerals, and nothing else.
- **Do** use the CS tile as the mark wherever the brand appears.

### Don't:
- **Don't** use a gradient-blob hero or stock illustration.
- **Don't** add a second accent hue, or use amber or green as decoration.
- **Don't** put drop shadows on flat cards, tables or inputs; only product frames and their overlays float.
- **Don't** invent users, testimonials, stats or uptime figures for any surface.
- **Don't** use Figtree for body text or JetBrains Mono for headings and labels.
