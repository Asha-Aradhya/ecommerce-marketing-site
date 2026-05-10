# Improvements

Astro's asset pipeline only optimizes files in `src/assets/` rendered via `<Image>` from `astro:assets`. To get the most out of it:

- **Raster images** (photos, illustrations) — use **WebP** or **AVIF**, rendered through `<Image>`.
- **Logos / icons** — use **SVG**. Astro 6 imports SVGs as components, so they're themeable via Tailwind classes (e.g., `class="text-navy-dark"`).
- **Videos** — Astro does **not** transcode. Pre-encode to **WebM** (optional MP4 fallback for older Safari).

Anything in `public/` is served raw — only use it for favicons and similar fixed-path files.
