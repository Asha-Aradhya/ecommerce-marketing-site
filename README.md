# ecommerce-marketing-site

A port of https://ecommerce-marketing-site.vercel.app/en/ — Astro + React islands + Tailwind CSS v4. Static page content lives in MDX collections; the Changelog page is sourced from a Strapi-style JSON fixture in `strapi/seed.json`.

## Stack

- **Astro 6** — static site generator (`output: 'static'`)
- **React 19** — used only for interactive islands (e.g. the changelog filter, mobile navbar drawer)
- **Tailwind CSS v4** — via the `@tailwindcss/vite` plugin; theme tokens live in `src/styles/global.css`
- **TypeScript strict**
- **Content collections** — MDX for homepage sections, YAML for pricing plans, JSON for the changelog
- **i18n** — `en` (default) + `nl`, with `prefixDefaultLocale: true`

## Requirements

- Node.js **≥ 20** (developed on 22.x)
- npm 10+

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Opens on [http://localhost:3000](http://localhost:3000). The port is pinned in `astro.config.mjs` — if it is busy, Astro will fall back to `3001`, `3002`, etc. **Always read the port the running instance reports** — Astro can leave stale processes behind after a restart that block the original port while serving outdated code from a new one. To clear stale instances:

```bash
lsof -iTCP -sTCP:LISTEN -P | grep node
kill <pid>
```

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/`. The build:

- Pre-renders every route to `dist/<route>/index.html`
- Optimises images via Astro's built-in image pipeline
- Generates `sitemap-index.xml` and `sitemap-0.xml`
- Bundles each React island as a separate JS chunk, hydrated only on the pages that use it

## Preview the production build

```bash
npm run preview
```

Serves `dist/` locally so you can verify the static output before deploying.

## Other scripts

| Script              | What it does                                                              |
| ------------------- | ------------------------------------------------------------------------- |
| `npm run lint`      | Runs ESLint across the project                                            |
| `npm run lint:fix`  | Lints and auto-fixes where possible                                       |

## Content modeling

| Content type        | Source                                  | Loader                              |
| ------------------- | --------------------------------------- | ----------------------------------- |
| Homepage sections   | MDX files in `src/content/{en,nl}/homepage/` | Astro `glob()` loader          |
| Pricing plans       | `src/content/en/pricing/plans.yaml`     | Astro `file()` loader               |
| Pricing FAQs        | MDX files in `src/content/en/pricing/faqs/` | Astro `glob()` loader           |
| Changelog entries   | Strapi v5 (Render) with `strapi/seed.json` fallback | Custom loader `src/lib/changelog-loader.ts` |

### Changelog — Strapi-backed with JSON fallback

The changelog is sourced from a live Strapi v5 instance ([repo](https://github.com/Asha-Aradhya/ecommerce-marketing-cms), deployed to Render). The custom loader fetches entries at **build time** so the deployed site is fully static — Strapi is never hit at runtime.

If Strapi is unreachable (cold start, network blip, missing env vars), the loader silently falls back to `strapi/seed.json` so the build always succeeds. Both data sources have the same shape, validated against the same Zod schema.

Required env vars (in Vercel for production, `.env` for local):

```
STRAPI_URL=https://ecommerce-marketing-cms.onrender.com
STRAPI_TOKEN=<read-only API token, find + findOne permissions>
```

### Data scripts

Two one-shot CLI scripts in `scripts/` manage the changelog data pipeline:

- **`scripts/fetch-changelog-bodies.mjs`** — brings data **IN** from `changelog.hypernode.com` → into your local `strapi/seed.json`. For each entry's `sourceUrl`, fetches the HTML, extracts the article body, converts to Markdown, writes it back as a `body` field. Run with: `node scripts/fetch-changelog-bodies.mjs`.

- **`scripts/strapi-seed.mjs`** — pushes data **OUT** from your local `strapi/seed.json` → into a Strapi CMS instance. Idempotent (upserts by `sourceUrl`). Run with:

  ```bash
  STRAPI_URL=<strapi-url> STRAPI_TOKEN=<token-with-create-update-permissions> npm run strapi:seed
  ```

Typical workflow: scrape Hypernode → fetch bodies into JSON → seed Strapi → site fetches from Strapi at build time.

## Deployment

The site builds to fully static HTML/CSS/JS in `dist/`, so any static host works: Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, GitHub Pages, etc. No server-side runtime is required.

`astro.config.mjs` pins `site: 'https://ecommerce-marketing-site.vercel.app'` — update this before deploying elsewhere so the canonical URLs and sitemap are correct.

### Recommended: Lighthouse CI on deploy

Adding a Lighthouse CI check to the deployment pipeline would catch performance, accessibility, and SEO regressions before they ship. A current PageSpeed Insights run scores 94/96/96/92, and gating future merges against those thresholds (or the Core Web Vitals) keeps that bar from quietly slipping as new pages and components land.

Options:

- **`@lhci/cli` in GitHub Actions** — run `lhci autorun` against the preview deploy URL, fail the job if any category drops below a configured threshold. Config lives in `lighthouserc.json` at the repo root.
- **Vercel's built-in Lighthouse integration** — runs against each preview deploy and posts the scores as a PR comment. Lower friction, no config file, but no hard gating.

A minimal `lighthouserc.json` to enforce the current baseline:

```json
{
  "ci": {
    "collect": { "url": ["https://<preview-url>/en/"], "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

## What I'd add with more time

- **Unit tests** — Vitest covering the changelog loader (Strapi-fetch path, fallback path, `releasedAt` → `publishedAt` mapping), the `/api/contact` Zod validator, and any data transformation utilities. Cheap to write, catches regressions when the Strapi schema or `seed.json` shape changes.
- **Accessibility audit and remediation** — The current implementation uses semantic HTML, aria-labels on icon-only buttons, and `eslint-plugin-jsx-a11y` enforces basic rules in source. With more time I would run a formal audit using `@axe-core/playwright` against every page + every locale, plus manual screen-reader testing with VoiceOver and NVDA. Lighthouse's accessibility score is a heuristic; axe + manual is the real check.
- **Storybook for the React islands** — `ChangelogFilter`, `PricingTabs`, `PricingTable`, `ContactForm`, `NavbarMobileDrawer`, `FooterTeamblue` each have multiple visual states (active tab, error state, empty filter, loading, etc.). A Storybook gives designers a stable URL to review components in isolation, and pairs naturally with visual-regression testing via Chromatic or Percy.
- **Integration tests** — Playwright covering the critical user flows: homepage loads in both locales, language toggle round-trips, changelog filter narrows entries by year + topic + search, pricing toggles update prices, contact form submits successfully and renders server-side errors when validation fails. Run in CI on every PR against the preview deploy URL — same target as Lighthouse CI above, same dependencies.

