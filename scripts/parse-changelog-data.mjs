// One-shot script to convert the saved Hypernode changelog HTML into
// `strapi/seed.json`. Re-run if you re-download a fresher snapshot.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const sourceHtml = resolve(projectRoot, 'Changelog (10_05_2026 20：21：44).html');
const outPath = resolve(projectRoot, 'strapi/seed.json');

// Newest entry gets this date; earlier entries step back ~weeklyish.
const newestDate = new Date('2026-05-09T00:00:00Z');

const html = await readFile(sourceHtml, 'utf8');

// One entry block: title (in <h2 ... src=URL>), then a <p>...<p>excerpt</p>...<a class=post-link>.
const entryRegex =
  /<h2 class="post-title style-h4" src=([^\s>]+)>([^<]+)<\/h2>\s*<p>\s*<p>([\s\S]*?)<\/p>\s*<a/g;

const minimalEntityMap = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&hellip;': '…',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#8211;': '–',
  '&#8212;': '—',
  '&#8216;': '‘',
  '&#8217;': '’',
  '&#8220;': '“',
  '&#8221;': '”',
};

function decodeEntities(input) {
  return input.replace(/&(amp|nbsp|hellip|lt|gt|quot|#\d+);/g, (raw) => minimalEntityMap[raw] ?? raw);
}

function stripInlineTags(input) {
  return input.replace(/<[^>]+>/g, '');
}

function deriveCategory(title) {
  if (/^Release \d+/i.test(title)) return 'Release';
  if (/v\d+\.\d+/i.test(title)) return 'Release';
  return 'Update';
}

function deriveSlugFromUrl(url) {
  return url.replace(/\/$/, '').split('/').pop();
}

const entries = [];
let match;
while ((match = entryRegex.exec(html)) !== null) {
  const [, sourceUrl, rawTitle, rawExcerpt] = match;
  entries.push({
    id: deriveSlugFromUrl(sourceUrl),
    title: decodeEntities(rawTitle).trim(),
    excerpt: decodeEntities(stripInlineTags(rawExcerpt)).replace(/\s+/g, ' ').trim(),
    category: deriveCategory(rawTitle),
    sourceUrl,
  });
}

entries.forEach((entry, indexFromNewest) => {
  const d = new Date(newestDate);
  d.setUTCDate(d.getUTCDate() - indexFromNewest * 7);
  entry.publishedAt = d.toISOString().slice(0, 10);
});

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(entries, null, 2) + '\n', 'utf8');

console.log(`✓ Wrote ${entries.length} entries to ${outPath}`);
