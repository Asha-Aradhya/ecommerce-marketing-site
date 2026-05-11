# CLAUDE.md

## Architecture rules (non-obvious)

- **English file names everywhere**, even for Dutch content (`coming-soon.astro`, not `binnenkort.astro`). Astro couples file path → URL, so this also means English URL paths across locales — except the existing `'/nl/prijzen/'` in `nav.plans.href` (still un-decided whether to align). See open question below.
- **Centralized translations** in `src/i18n/ui.ts`, accessed via `useTranslations(lang)`. No `isNL` ternaries scattered through templates.
- **Per-locale page files are thin** (~15 lines): URL pin + SEO (canonical/OG/hreflang) + `langSwitchHref`. Shared UI lives in `src/components/` and `src/layouts/`.
- **Path aliases**: `@/*` → `src/*`, `@assets/*` → `src/assets/*` (configured in both `tsconfig.json` and Vite resolve).
- **React islands only when interactivity needed**. Static UI stays in `.astro`.
- **All "future" CTAs link to `/{locale}/coming-soon/`** instead of dead `#` anchors. New nav targets get added there until a real page exists.
- **SVG sprite system** is planned for icons; not yet implemented (icons currently inline in components).

## Tailwind v4 specifics

- Theme tokens are defined in `@theme {}` in `src/styles/global.css`. Examples: `--color-navy-dark: #063B67`, `--color-orange: #FF7100`, `--font-sans`.
- **Use theme-token classes (`text-navy-dark`)** rather than arbitrary hex (`text-[#063b67]`). Theme tokens generate CSS variables on `:root` and have more reliable cascade behavior. There's still some `text-[#...]` debt in `Navbar.astro` worth cleaning up.
- **Custom base styles MUST be inside `@layer base`**. Unlayered styles override `@layer utilities` per CSS Cascade Level 5. Earlier bug: an `a { color: inherit }` written outside `@layer base` overrode utility text colors and turned every nav link gray.

## Big gotcha — dev server stale port

When `npm run dev` is restarted, Astro can leave a **stale process on the original port** (4321/4324) while the new instance binds to a fresh port (4325/4326). The browser keeps hitting the stale port and shows old code, making it look like edits don't take effect. Burned ~1 hour on this debugging the mobile drawer.

If anything looks broken after an edit:

```bash
lsof -iTCP -sTCP:LISTEN -P | grep node
```

Kill stale processes, hard-refresh the browser, and confirm you're on the port the current `npm run dev` reports.

## User collaboration preferences (mirrored from Claude memory)

- **Build step by step.** User reviews each file change before the next one. Don't batch-implement multiple files unless asked.
- **Terse responses.** No trailing "I just did X, Y, Z" summaries — the diff speaks for itself.
- **English file names** (rule above).
- **Descriptive variable names** — `prev => !prev`, not `o => !o`. Avoid single-letter identifiers everywhere except the most conventional cases.
- User is learning Astro and Tailwind v4 — when a non-obvious decision is made, briefly explain the *why*.

