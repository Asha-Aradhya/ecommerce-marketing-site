import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Loader } from 'astro/loaders';

interface StrapiChangelogEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Release' | 'Update';
  topic: string;
  sourceUrl: string;
  releasedAt: string;
  body?: string | null;
}

interface ChangelogEntry {
  id: string;
  title: string;
  excerpt: string;
  category: 'Release' | 'Update';
  topic: string;
  sourceUrl: string;
  publishedAt: string;
  body?: string;
}

async function fetchFromStrapi(): Promise<ChangelogEntry[] | null> {
  const strapiUrl = (import.meta.env.STRAPI_URL ?? process.env.STRAPI_URL)?.replace(/\/$/, '');
  const strapiToken = import.meta.env.STRAPI_TOKEN ?? process.env.STRAPI_TOKEN;

  if (!strapiUrl || !strapiToken) {
    return null;
  }

  const url = `${strapiUrl}/api/changelog-entries?pagination[pageSize]=100&sort=releasedAt:desc`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${strapiToken}` },
  });

  if (!response.ok) {
    throw new Error(`Strapi responded ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as { data: StrapiChangelogEntry[] };

  return payload.data.map((entry) => ({
    id: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt,
    category: entry.category,
    topic: entry.topic,
    sourceUrl: entry.sourceUrl,
    publishedAt: entry.releasedAt,
    body: entry.body ?? undefined,
  }));
}

async function loadFromSeedJson(): Promise<ChangelogEntry[]> {
  const seedPath = resolve(process.cwd(), 'strapi/seed.json');
  const raw = await readFile(seedPath, 'utf8');
  return JSON.parse(raw) as ChangelogEntry[];
}

export function changelogLoader(): Loader {
  return {
    name: 'changelog-strapi-with-fallback',
    load: async ({ store, parseData, logger }) => {
      let entries: ChangelogEntry[] | null = null;

      try {
        entries = await fetchFromStrapi();
        if (entries) {
          logger.info(`Loaded ${entries.length} changelog entries from Strapi`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`Strapi fetch failed (${message}). Falling back to strapi/seed.json.`);
      }

      if (!entries) {
        entries = await loadFromSeedJson();
        logger.info(`Loaded ${entries.length} changelog entries from strapi/seed.json fallback`);
      }

      store.clear();
      for (const entry of entries) {
        const parsedData = await parseData({
          id: entry.id,
          data: entry as unknown as Record<string, unknown>,
        });
        store.set({ id: entry.id, data: parsedData });
      }
    },
  };
}
