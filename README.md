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
| Changelog entries   | `strapi/seed.json`                      | Astro `file()` loader               |

### Changelog — Strapi-shaped JSON fixture

The assignment allows "a seed script or JSON fixture" in place of a deployed Strapi. This project takes the fixture path:

- `scripts/parse-changelog-data.mjs` parses an HTML snapshot of [changelog.hypernode.com](https://changelog.hypernode.com) and writes `strapi/seed.json`. Re-run it when refreshing the source data.
- `src/content.config.ts` loads `strapi/seed.json` directly via Astro's content collection (`changelog-en`).
- The schema (`title`, `excerpt`, `category`, `topic`, `sourceUrl`, `publishedAt`) is validated by Zod at build time and matches what a Strapi `Changelog Entry` content-type would expose.

The changelog page reads the JSON at build time — no Strapi instance is required to develop, build, or deploy.

## Deployment

The site builds to fully static HTML/CSS/JS in `dist/`, so any static host works: Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, GitHub Pages, etc. No server-side runtime is required.

`astro.config.mjs` pins `site: 'https://ecommerce-marketing-site.vercel.app'` — update this before deploying elsewhere so the canonical URLs and sitemap are correct.
