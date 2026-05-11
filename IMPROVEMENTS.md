# Improvements

Astro's asset pipeline only optimizes files in `src/assets/` rendered via `<Image>` from `astro:assets`. To get the most out of it:

- **Raster images** (photos, illustrations) — use **WebP** or **AVIF**, rendered through `<Image>`.
- **Logos / icons** — use **SVG**. Astro 6 imports SVGs as components, so they're themeable via Tailwind classes (e.g., `class="text-navy-dark"`).
- **Videos** — Astro does **not** transcode. Pre-encode to **WebM** (optional MP4 fallback for older Safari).

Anything in `public/` is served raw — only use it for favicons and similar fixed-path files.

## SEO — sitemap & robots.txt (if this were a real production site)

This project already generates `sitemap-index.xml` + `sitemap-0.xml` via `@astrojs/sitemap`, with hreflang annotations linking the `/en/` and `/nl/` variants. Because this build is deployed to a `*.vercel.app` preview URL for an assignment, the site should **not** be indexed — a `public/robots.txt` with `Disallow: /` is enough, and Search Console is intentionally skipped.

For a real production deployment on a proper domain, the following would be done:

### 1. `public/robots.txt`

Add a robots file that allows crawling and points to the sitemap so non-Google crawlers (Bing, DuckDuckGo, etc.) can discover it:

```
User-agent: *
Allow: /
Sitemap: https://www.realdomain.com/sitemap-index.xml
```

Files placed in `public/` are copied to the output root verbatim, so it's served at `/robots.txt`.

### 2. Update `astro.config.mjs`

Change `site` from the Vercel preview URL to the real production domain so all generated sitemap URLs and canonical tags resolve correctly:

```js
site: 'https://www.realdomain.com',
```

### 3. Google Search Console

- Verify domain ownership (DNS TXT record is the most robust method).
- Submit `https://www.realdomain.com/sitemap-index.xml` under **Sitemaps**.
- Monitor the **Coverage** report for indexing errors and the **Performance** report for search queries.
