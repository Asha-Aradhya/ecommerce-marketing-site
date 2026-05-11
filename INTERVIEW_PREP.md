# Interview prep — Hypernode port

Likely questions and short answers. Each answer is one or two sentences plus a one-line follow-up if asked to elaborate.

---

## Stack & architecture

**Q: Why did you choose Astro?**
Astro is built for content-heavy marketing sites — it ships zero JS by default, hydrates only the interactive bits as "islands," and has first-class i18n + content collections. That matches the assignment's static page + small interactive widgets shape exactly.

**Q: Why React for the islands instead of Astro components?**
The islands need real client-side state (filtering, accordion toggles, mobile drawer, form state) — that's what React is good at. Static UI stays in `.astro`, which never ships to the browser as JS.

**Q: Why Tailwind v4?**
v4 has theme tokens defined directly in CSS (`@theme {}` in `global.css`), no `tailwind.config.js`. It's simpler and faster, and the tokens become CSS custom properties on `:root` automatically.

**Q: Why static output instead of SSR?**
A marketing site doesn't need server runtime — every page is the same for everyone. Static builds are cheaper, faster, and never go down. Strapi is fetched only at build time.

---

## Content modeling

**Q: Walk me through your content sources.**

| Content | Source | Why |
|---|---|---|
| Homepage sections | MDX in `src/content/{en,nl}/homepage/` | Prose bodies + structured frontmatter — MDX fits |
| Pricing plans | `plans.yaml` in `src/content/{en,nl}/pricing/` | Tabular numeric data — YAML fits |
| Pricing FAQs | MDX in `src/content/{en,nl}/pricing/faqs/` | Prose answers with embedded links |
| Changelog entries | Strapi v5 (Render) + `seed.json` fallback | Assignment specifies Strapi |

The shape dictates the format: prose with bodies → MDX, structured rows → YAML.

**Q: Why MDX over plain Markdown?**
MDX gives me Markdown bodies AND typed frontmatter validated by Zod. So content authors get rich text formatting while the build catches schema errors.

**Q: Why not one big homepage MDX file with everything?**
Each section has its own `type` discriminator (`feature-section`, `feature-grid`, `logo-strip`, `testimonials`) — they're different shapes. A discriminated union in Zod validates the right schema per section, build fails per-file on typos, and editing one section is one-file changes in git.

**Q: Why is the FAQ in MDX instead of inline JSX?**
Originally it was a hardcoded JS array. I refactored to MDX so each Q&A has a proper Markdown body with real links (instead of `set:html` of pre-built HTML strings). This is safer (no XSS bypass) and CMS-friendly.

---

## i18n

**Q: How does the language switcher work?**
`BaseLayout.astro` computes a `langSwitchHref` by swapping the locale prefix in the current URL. Pages can override it via prop — e.g. changelog pages set `langSwitchHref="/nl/"` because there's no Dutch changelog, so the toggle skips straight to Dutch home.

**Q: Why `prefixDefaultLocale: true`?**
Symmetric URLs (`/en/...` and `/nl/...`) — both locales are first-class, hreflang is cleaner, adding a 3rd language doesn't restructure existing URLs. Cost: a redirect from `/` to `/en/` (handled by `vercel.json`).

**Q: Why are some Strings not translated (Magento, NGINX, partner products)?**
Brand names, technical protocol names, and partner-supplied marketing copy stay in their source language. That's standard practice on multilingual marketing sites — translating "NGINX" or "Magento" would be wrong.

**Q: How do React islands receive translations?**
They can't import the i18n module directly (would bloat the client bundle). The parent `.astro` reads translations via `useTranslations(lang)` and passes them as a typed `labels` prop. The React component sees plain strings.

**Q: Why separate `pages/en/index.astro` and `pages/nl/index.astro` instead of dynamic `[locale]/index.astro`?**
At 2 locales, the duplication is 3 lines per page; per-locale meta tags and `langSwitchHref` overrides stay cleaner in separate files. If we grew to 5+ locales, I'd refactor to a dynamic route.

---

## Strapi integration

**Q: How does the changelog data flow?**
At build time, a custom Astro content loader (`src/lib/changelog-loader.ts`) calls `GET /api/changelog-entries` on the production Strapi (hosted on Render). The response is mapped to the schema, validated by Zod, and stored in Astro's content collection. The build then renders to static HTML.

**Q: What happens if Strapi is down at build time?**
The loader catches the fetch error and falls back to `strapi/seed.json`. The build never fails — worst case, the site ships with last-known data. This is what makes the deploy resilient to Render's free-tier cold starts.

**Q: Why fetch at build time instead of runtime?**
End users never hit Strapi — they get static HTML served from Vercel's CDN. No cold starts, no API rate limits, no token in the browser. The trade-off is that fresh CMS content requires a rebuild, but for a marketing site that's fine (and Vercel rebuilds can be triggered via webhook).

**Q: Why isn't the changelog in Dutch?**
The Strapi schema has one set of fields per entry — adding Dutch translations would require either duplicate entries or a localization layer in Strapi. Out of scope for the assignment timeline. The Dutch navbar links to the English changelog as a deliberate fallback.

**Q: Why is the Strapi field called `releasedAt` instead of `publishedAt`?**
Strapi v5 reserves `publishedAt` as a system field for draft/publish state. To avoid collision, I named the real-world release date `releasedAt` in Strapi and map it to `publishedAt` in the loader. The rest of the site code never sees the rename.

**Q: Why didn't you use `import.meta.env` everywhere?**
The loader uses `import.meta.env.STRAPI_URL ?? process.env.STRAPI_URL`. Astro/Vite expose env vars via `import.meta.env` when reading from `.env` files; CI platforms like Vercel inject vars into `process.env`. Falling back keeps the loader portable across local dev, Vercel builds, and standalone Node scripts.

---

## Component architecture

**Q: When do you choose `.astro` vs React?**
`.astro` for anything static. React for anything with `useState` / event handlers / form state. The decision is: "does this need to re-render in the browser?" If no, it's `.astro` — ships zero JS.

**Q: Which components are React islands and why?**

| Component | Directive | Reason |
|---|---|---|
| `NavbarMobileDrawer` | `client:load` | Top of every page, user might tap immediately on mobile |
| `PricingTabs` + `PricingTable` | `client:load` | Above-the-fold and primary interaction on pricing page |
| `ChangelogFilter` | `client:visible` | Defer JS until the filter scrolls into viewport |
| `FooterTeamblue` | `client:visible` | Footer — only matters once the user scrolls down |
| `ContactForm` | `client:visible` | Mid-page; form is only interactive once visible |

**Q: What's an Astro island, in one sentence?**
An interactive component embedded in static HTML — Astro renders it server-side once, then ships just that component's JS to the browser to hydrate it.

**Q: How do you decide between `client:load` vs `client:visible` vs `client:idle`?**
- `client:load` — needs JS immediately on page load (nav drawer, pricing toggles above the fold)
- `client:visible` — only matters when scrolled into view (footer, mid-page form, below-the-fold filter)
- `client:idle` — defer until the browser is idle (would use for a chat widget)

The default rule: pick the most conservative directive that still produces correct UX. `client:load` everywhere is the lazy default and ships JS the user may never need.

---

## Contact form & API endpoint

**Q: How does the contact form submit?**
Client-side React form (`react-hook-form` + Zod) POSTs JSON to `/api/contact`, a server-side Astro endpoint that runs as a Vercel serverless function. The endpoint re-validates with the same Zod shape, optionally forwards to a CRM, and returns a JSON success/error response.

**Q: Why a server-side endpoint instead of POSTing directly from the browser?**
Three reasons:
1. **Security** — client-side validation can be bypassed (curl, devtools). The server enforces the same Zod schema independently.
2. **Secret handling** — the CRM bearer token lives in `LEAD_API_TOKEN` server env, never reaches the browser.
3. **CORS** — POSTing browser → CRM directly hits CORS preflight; proxying server → CRM avoids it.

**Q: Walk me through the validation strategy.**
The contact form has one Zod schema in the React component (for inline field errors) and an *equivalent* schema in `src/pages/api/contact.ts` (for server validation). Both reject the same inputs the same way. If a malicious user bypasses the client, the server returns 400 with `{ success: false, errors: [{ field, message }] }`.

**Q: Why `@astrojs/vercel` adapter?**
API routes that POST need a runtime — without an adapter, `astro build` in static mode can't compile a `prerender = false` endpoint. The Vercel adapter compiles those endpoints into Vercel serverless functions while leaving static pages pre-rendered. Result: hybrid build — 99% static + 1 function for form submissions.

**Q: What does "hybrid output" mean in practice?**

| What | Where it lives | When it runs |
|---|---|---|
| Every `.astro` page | Static HTML in `dist/` | Once at build time |
| `/api/contact` | Serverless function on Vercel | On each form submission |

End users hit static HTML for every page they read. Only form submissions touch a function. The function scales to zero when idle, so the free tier easily handles demo traffic.

---

## Deployment

**Q: Where is the site deployed and how?**
The Astro site is on Vercel (hybrid output, auto-deploys on push to GitHub). The Strapi CMS is a separate repo on a Render Web Service backed by Render Postgres. Each is an independent service with its own deploy cycle.

**Q: What env vars does the site need?**
Two **required** (build-time): `STRAPI_URL` and `STRAPI_TOKEN` — the loader reads these to fetch the changelog. Two **optional** (runtime): `LEAD_API_URL` and `LEAD_API_TOKEN` — the contact endpoint forwards submissions to a CRM if these are set, otherwise logs to function output. All four are server-only (no `PUBLIC_` prefix).

**Q: How are secrets protected?**
The Strapi API token is read at build time only, used to fetch data, then discarded — the resulting HTML is plain text with no token reference. A user viewing source can't extract it. The production token has read-only permissions (`find` + `findOne`), so even if leaked, the worst it allows is reading public-ish changelog data.

**Q: How do you keep the site deindexed during review?**
The Vercel preview URL doesn't have a `robots.txt` yet — if I were to add one, it would be `Disallow: /`. That's documented as a future task in `IMPROVEMENTS.md` so I don't compete with the real `hypernode.com` for SEO.

**Q: Why a separate Strapi repo?**
Different runtime model — Strapi is a long-running Node server; Astro is a static generator. Different deploy targets (Render vs Vercel), different dependency trees, different build commands. Mixing them would mean Render rebuilds the whole repo on every Astro tweak and vice versa.

---

## Performance & SEO

**Q: What's your performance story?**
Static HTML served from Vercel's CDN, JS only on islands (avg ~30KB total per page), images optimized via Astro's image pipeline, fonts subset via Google Fonts. No runtime API calls — first byte is HTML.

**Q: What SEO is in place?**
Per-page `<title>` / `<meta description>` / `<link rel=canonical>` / OG / Twitter Card / hreflang / `<html lang>`, auto-generated sitemap (`@astrojs/sitemap`). All in `BaseLayout.astro`.

**Q: What's missing in SEO that you'd add next?**
- `og:image` file (currently references a missing default)
- `robots.txt` (for the preview deindex)
- `hreflang="x-default"` (Google's recommendation)
- JSON-LD structured data (`Organization`, `WebSite`) for rich-result eligibility

All listed in `IMPROVEMENTS.md`.

**Q: What about accessibility?**
Semantic HTML throughout (`<nav>`, `<main>`, `<section>`, `<article>`), aria-labels on icon-only buttons, focus states on interactive elements, proper heading hierarchy. ESLint has `eslint-plugin-jsx-a11y` enforcing rules on the React side.

---

## Validation & types

**Q: How are content errors caught at build time?**
Each content collection has a Zod schema attached. Astro validates every entry against it during `astro build`. A typo in an MDX frontmatter (e.g. `imageSide: lft` instead of `left`) fails the build with a precise error pointing to the offending file.

**Q: What does Zod do that TypeScript can't?**
TypeScript only exists at compile time and disappears in the compiled JS. Zod validates at **runtime** — useful when data comes from files (MDX/YAML/JSON) or APIs (Strapi), where TypeScript can't see the actual values.

**Q: How is your TypeScript strict?**
`tsconfig.json` extends `astro/tsconfigs/strict` — `noImplicitAny`, `strictNullChecks`, etc. There are a couple of casts at boundary points (e.g. `entry as unknown as Record<string, unknown>` when passing data to Astro's loader API), but the rest is fully typed.

---

## Specific code questions

**Q: Walk me through the changelog loader.**
1. Tries to read `STRAPI_URL` + `STRAPI_TOKEN` from env (with fallback chain `import.meta.env` → `process.env`).
2. Fetches `GET /api/changelog-entries?pagination[pageSize]=100&sort=releasedAt:desc`.
3. Maps Strapi's `releasedAt` field back to `publishedAt` (so the rest of the site keeps the original field name).
4. On any fetch error or missing env vars, falls back to reading `strapi/seed.json`.
5. Writes each entry into Astro's content store via `parseData` (which runs the Zod schema) + `store.set`.

**Q: Why the double cast `entry as unknown as Record<string, unknown>`?**
Astro's loader API takes `Record<string, unknown>` for `data`. Our typed `ChangelogEntry` interface is structurally compatible but lacks an index signature, so TypeScript needs the `unknown` step as an escape hatch. The actual validation happens inside `parseData`.

**Q: Explain the FAQ data flow.**
`Faq.astro` reads `Astro.currentLocale`, loads the appropriate collection (`pricing-faqs-en` or `pricing-faqs-nl`), sorts by `order`, renders each entry's Markdown body via Astro's `<Content />` component. The accordion is native `<details name="faq">` — no JS, no React, just HTML.

**Q: Why `<details name="faq">` instead of a React accordion?**
HTML `<details>` is native, accessible, keyboard-navigable, and the `name` attribute (added in Chrome 120, Safari 17.4) makes the group behave like a radio set — opening one closes the others. Zero JS shipped.

---

## What you'd do differently / next

**Q: What's the biggest thing you'd improve with more time?**
Dutch changelog support. Right now the changelog is English-only — adding a localized `body` field per locale in Strapi would be the right move, then the loader fans out per language. ~2 hours of work.

**Q: What architectural change would you make if scaling to 5+ locales?**
Switch from per-locale page files to a single dynamic route (`[locale]/index.astro`) with `getStaticPaths`. At 2 locales the duplication is trivial; at 5+ it becomes worth the abstraction.

**Q: How would you handle CMS content updates in production?**
Set up a Strapi webhook that POSTs to a Vercel deploy hook on save → triggers a rebuild → 2-3 min later the site is updated. The user never sees stale data.

**Q: What would you put in the production Strapi schema that isn't there now?**
- Localized `body` per locale (or a separate `ChangelogEntry` content type per locale)
- A `featured` boolean for highlighting entries
- An `author` relation to a `User`
- Tags as a relational field instead of an enum

---

## Things you might get tripped up on (be honest)

**Q: There's still hardcoded "Production" / "Development" text in PricingTabs — wait no, you fixed that.**
Right — that was an early version. The current build uses a typed `labels` prop pattern: parent Astro reads i18n strings, passes them down to the React island. Same pattern for `FooterTeamblue` and `PricingTable`.

**Q: The team.blue partner product descriptions are still in English on the Dutch site.**
Yes — those are partner-supplied marketing copy for international brands (Webnode, Metricool, etc.). Translating partner content unilaterally is wrong; partners own their messaging. Real multilingual sites leave partner descriptions in source language for this reason.

**Q: Why did you delete `parse-changelog-data.mjs`?**
It was a one-shot bootstrap script that converted a saved Hypernode HTML snapshot into `seed.json`. The HTML file is gone and the JSON is committed, so the script can't run anymore and adds reader confusion. Data provenance is documented in `README.md` instead.

**Q: Why are React Query and DOMPurify NOT in your dependencies?**
I removed them. React Query is for client-side runtime data fetching — we fetch at build time inside Node, so there's no React component lifecycle to attach to. DOMPurify was for sanitizing CMS HTML, but switching to Astro's `<Content />` rendering for MDX bodies removed the need. Don't keep dependencies you don't use.

---

## Curveballs

**Q: How would your build behave if someone added a new field to the Strapi schema?**
The Strapi API would return the new field, but the Zod schema in `content.config.ts` doesn't know about it — Zod schemas are strict by default and would either ignore the extra field (`.strip()` behavior) or fail the build (`.strict()`). I'd add the field to the schema, update the loader's field mapping, and the rest of the build keeps working.

**Q: What if the assignment said "support 5 languages"?**
Three changes: (1) refactor pages to a dynamic `[locale]/index.astro` route, (2) generalize the language switcher to a dropdown instead of a binary toggle, (3) add the 3 new locale dictionaries to `i18n/ui.ts` and content folders. The architecture supports it without code rewrites.

**Q: Why didn't you write tests?**
Time trade-off. For a take-home, I prioritized shipping working features over test coverage. The Zod schemas act as content-shape contracts (catch errors at build), and the TypeScript types catch shape mismatches across function boundaries. If this were a real production codebase, I'd add Playwright for critical user flows (homepage load, language toggle, changelog filter, contact form submit) and component tests for the React islands.

**Q: How do you know the build actually works in production?**
The Vercel build runs `npm run build` (same as locally), which invokes the loader, validates against Zod, and produces static HTML. The deploy logs show the loader's `info: Loaded 32 changelog entries from Strapi` line — if that's missing or shows the fallback, I know to investigate.

---

## Quick stats to memorize

- **Stack**: Astro 6.3 + React 19 + Tailwind v4 + TypeScript strict
- **Output mode**: Hybrid (static pages + 1 serverless function for `/api/contact`)
- **i18n**: en + nl, `prefixDefaultLocale: true`
- **Content collections**: 7 (homepage × 2 locales, pricing-plans × 2, pricing-faqs × 2, changelog en)
- **Changelog entries**: 32 (15 with real bodies fetched from Hypernode, 17 fall back to excerpt)
- **React islands**: 5 (NavbarMobileDrawer, ChangelogFilter, PricingTabs+Table, FooterTeamblue, ContactForm)
- **Hydration directives**: 2 × `client:load` (Navbar, PricingTabs), 3 × `client:visible` (ChangelogFilter, FooterTeamblue, ContactForm)
- **API endpoints**: 1 (`POST /api/contact`)
- **CMS**: Strapi v5, TypeScript, Postgres on Render
- **Hosting**: Vercel (site, hybrid build) + Render (CMS) — two repos, two deploy pipelines
