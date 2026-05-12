// Shape of a single entry as returned by the Strapi REST API.
// Strapi uses `releasedAt` because `publishedAt` is reserved as a system field.
export interface StrapiChangelogEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Release' | 'Update';
  topic: string;
  sourceUrl: string;
  releasedAt: string;
  body?: string | null;
}

// Shape consumed by the rest of the site after the loader normalises the data.
// `releasedAt` is mapped back to `publishedAt` here so the consumer code is
// agnostic to whether the data came from Strapi or the JSON fixture.
export interface ChangelogEntry {
  id: string;
  title: string;
  excerpt: string;
  category: 'Release' | 'Update';
  topic: string;
  sourceUrl: string;
  publishedAt: string;
  body?: string;
}
