import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ecommerce-marketing-site.vercel.app',
  // Hybrid output: all routes are pre-rendered by default for static delivery,
  // except API routes that opt into server rendering with `export const prerender = false`.
  output: 'static',
  adapter: vercel(),
  server: {
    port: 3000,
  },
  redirects: {
    '/nl/changelog': '/nl/',
  },
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@assets': '/src/assets',
      },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
