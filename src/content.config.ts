import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const en = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/en' }),
});

const nl = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/nl' }),
});

export const collections = { en, nl };
