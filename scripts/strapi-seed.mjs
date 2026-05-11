// Seeds a Strapi v5 instance with the changelog entries in `strapi/seed.json`.
// Idempotent: re-runs update existing entries by `sourceUrl` instead of
// duplicating. The JSON field `publishedAt` is mapped to Strapi's `releasedAt`
// because Strapi v5 reserves `publishedAt` as a system field.
//
// Usage (local Strapi):
//   STRAPI_URL=http://localhost:1337 \
//   STRAPI_TOKEN=<api-token> \
//   npm run strapi:seed
//
// Usage (production Strapi on Render):
//   STRAPI_URL=https://your-cms.onrender.com \
//   STRAPI_TOKEN=<api-token> \
//   npm run strapi:seed

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(here, '..', 'strapi', 'seed.json');

const strapiUrl = process.env.STRAPI_URL?.replace(/\/$/, '');
const strapiToken = process.env.STRAPI_TOKEN;

if (!strapiUrl || !strapiToken) {
  console.error('Missing env vars. Set STRAPI_URL and STRAPI_TOKEN before running.');
  process.exit(1);
}

const collectionEndpoint = `${strapiUrl}/api/changelog-entries`;

const authHeaders = {
  Authorization: `Bearer ${strapiToken}`,
  'Content-Type': 'application/json',
};

async function findEntryBySourceUrl(sourceUrl) {
  const query = new URLSearchParams({
    'filters[sourceUrl][$eq]': sourceUrl,
    'pagination[pageSize]': '1',
  });
  const response = await fetch(`${collectionEndpoint}?${query.toString()}`, {
    headers: authHeaders,
  });
  if (!response.ok) {
    throw new Error(`Lookup failed (${response.status}): ${await response.text()}`);
  }
  const payload = await response.json();
  return payload.data?.[0] ?? null;
}

async function createEntry(entryPayload) {
  const response = await fetch(collectionEndpoint, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ data: entryPayload }),
  });
  if (!response.ok) {
    throw new Error(`Create failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

async function updateEntry(documentId, entryPayload) {
  const response = await fetch(`${collectionEndpoint}/${documentId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ data: entryPayload }),
  });
  if (!response.ok) {
    throw new Error(`Update failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

function toStrapiPayload(seedEntry) {
  return {
    title: seedEntry.title,
    slug: seedEntry.id,
    excerpt: seedEntry.excerpt,
    category: seedEntry.category,
    topic: seedEntry.topic,
    sourceUrl: seedEntry.sourceUrl,
    releasedAt: seedEntry.publishedAt,
    body: seedEntry.body ?? null,
  };
}

const seedEntries = JSON.parse(await readFile(seedPath, 'utf8'));

let createdCount = 0;
let updatedCount = 0;
let failedCount = 0;

for (const seedEntry of seedEntries) {
  const payload = toStrapiPayload(seedEntry);
  try {
    const existing = await findEntryBySourceUrl(seedEntry.sourceUrl);
    if (existing) {
      await updateEntry(existing.documentId, payload);
      updatedCount += 1;
      console.log(`updated  ${seedEntry.id}`);
    } else {
      await createEntry(payload);
      createdCount += 1;
      console.log(`created  ${seedEntry.id}`);
    }
  } catch (error) {
    failedCount += 1;
    console.error(`failed   ${seedEntry.id} — ${error.message}`);
  }
}

console.log(
  `\nDone. created=${createdCount} updated=${updatedCount} failed=${failedCount} total=${seedEntries.length}`,
);

if (failedCount > 0) process.exit(1);
