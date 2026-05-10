# CLAUDE.md

Handoff document for resuming this project on another machine. Commit before laptop switch.

## Project

Take-home assignment: build an identical replica (not a mock) of **hypernode.com** — an ecommerce hosting marketing site. The user is a developer working through the assignment step by step with Claude as a pair.

## Stack

- **Astro 6.3.1** — SSG, static output. Upgraded from Astro 5 due to XSS fix.
- **React 19** — used as Astro islands only; conservative hydration (`client:load` only where required).
- **Tailwind CSS v4** — installed via `@tailwindcss/vite` plugin in `astro.config.mjs`. **Not** `@astrojs/tailwind`.
- **MDX** content collections for page copy (`src/content.config.ts` with glob loader).
- **TypeScript strict** — extends `astro/tsconfigs/strict`, JSX via `react-jsx`.
- **Strapi v5** — planned for changelog. Seed script stub at `scripts/strapi-seed.mjs`.
- Other deps: `@tanstack/react-query`, `dompurify`, `zod`, `eslint-plugin-astro`, `eslint-plugin-jsx-a11y`.

## Routes (Astro i18n: `prefixDefaultLocale: true`, locales `['en','nl']`)

| URL | Status | File |
|---|---|---|
| `/` | done | `src/pages/index.astro` (301 → `/en/`) |
| `/en/` | placeholder | `src/pages/en/index.astro` |
| `/nl/` | not yet built | — |
| `/en/plans-and-prices/`, `/nl/prijzen/` | not built | — |
| `/en/changelog/`, `/nl/changelog/` | not built (Strapi-driven) | — |
| `/en/coming-soon/`, `/nl/coming-soon/` | done — stub for unbuilt CTAs | `src/pages/{en,nl}/coming-soon.astro` |

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

## Status of work in progress

### Done
- Project scaffolded; Astro 5 → 6.3.1 upgrade.
- ESLint config: tseslint scoped to non-`.astro` files (Astro parser conflict otherwise).
- `src/content.config.ts` with glob loader for `en/` and `nl/` collections.
- `BaseLayout.astro` — full SEO (title/description/canonical/OG/Twitter/hreflang), Montserrat from Google Fonts.
- **Navbar** — two-tier (topbar with language toggle + main row with logo + desktop links). Desktop nav inline in `.astro`. Mobile drawer is a React island (`NavbarMobileDrawer.tsx`, `client:load`) using `position: fixed`, dynamic header-height measurement via `useIsomorphicLayoutEffect`.
- i18n strings for nav and coming-soon page.
- coming-soon stub pages (`/en/coming-soon/`, `/nl/coming-soon/`).
- Hero video downloaded — `src/assets/videos/servers.webm` (767 KB, from hypernode.com).

### Currently in progress — Hero component
Plan agreed with user:
1. Add hero copy to `src/i18n/ui.ts` — `hero.headline`, `hero.subheadline`, `hero.cta.primary`, `hero.cta.secondary`.
2. Build `src/components/home/Hero.astro`:
   - Looping/muted/autoplay `<video>` background using `servers.webm`.
   - Rounded corners on outer container, dark overlay if needed for legibility.
   - Centered headline + subheadline (white).
   - Orange primary CTA "Start 14-day free trial" → `t('nav.comingSoon.href')`.
   - White text-link secondary CTA "Get free hosting consult" → `t('nav.comingSoon.href')`.
3. Drop `<Hero />` into `src/pages/en/index.astro`.

Reference screenshot from hypernode.com is what the user wants to match (centered text, two CTAs at bottom of hero).

### Next after Hero
- `src/pages/nl/index.astro` (mirror of en homepage).
- Footer component.
- Homepage feature sections — assets already in `src/assets/images/homepage/` (`cloud-hosting.svg`, `green-hosting.svg`, `support.svg`, etc.).
- Testimonials section (assets in `src/assets/images/homepage/testimonials/`).
- Company logo strip (assets in `src/assets/images/homepage/company-logos/`).
- Plans & prices page (`/en/plans-and-prices/`, `/nl/prijzen/`).
- Changelog page + Strapi v5 seed.

## Open questions / decisions to revisit

1. `'nav.plans.href': '/nl/prijzen/'` is the only remaining localized URL path. Either align to `/nl/plans-and-prices/` for consistency with the file-naming rule, or accept it as-is once a real `prijzen.astro` exists. Defer until building the plans page.
2. Whether to use a single `[locale]/index.astro` dynamic route (with `getStaticPaths`) or stay with separate `en/` + `nl/` files. Current preference: stay separate — files are thin enough that it's not worth the dynamic-route machinery.

## User collaboration preferences (mirrored from Claude memory)

- **Build step by step.** User reviews each file change before the next one. Don't batch-implement multiple files unless asked.
- **Terse responses.** No trailing "I just did X, Y, Z" summaries — the diff speaks for itself.
- **English file names** (rule above).
- **Descriptive variable names** — `prev => !prev`, not `o => !o`. Avoid single-letter identifiers everywhere except the most conventional cases.
- User is learning Astro and Tailwind v4 — when a non-obvious decision is made, briefly explain the *why*.

## Resuming on the new machine

1. `git pull` (or copy directory).
2. `npm install`.
3. `npm run dev` — note the actual port it reports.
4. Re-read this doc + the `feedback_*.md` files in `~/.claude/projects/.../memory/` if Claude memory is set up there too.
5. Pick up at "Currently in progress — Hero component" → step 1.
