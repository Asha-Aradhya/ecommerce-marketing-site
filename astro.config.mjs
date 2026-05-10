import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ecommerce-marketing-site.vercel.app',
  server: {
    port: 3000,
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
