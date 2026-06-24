// One-shot script: fetches each changelog entry's full body from its
// `sourceUrl` on changelog.cloudnode.com, extracts the article HTML,
// converts it to Markdown, and writes it back into `strapi/seed.json`
// as a `body` field. Re-run is safe — entries with an existing `body`
// are skipped.
//
// Usage:
//   node scripts/fetch-changelog-bodies.mjs
//
// After this, run `npm run strapi:seed` against production Strapi to
// push the new body content into the live CMS.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(here, '..', 'strapi', 'seed.json');

const entities = {
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
  '&#039;': "'",
  '&#39;': "'",
};

function decodeEntities(input) {
  return input.replace(/&(amp|nbsp|hellip|lt|gt|quot|#8211|#8212|#8216|#8217|#8220|#8221|#039|#39|#\d+);/g, (raw) => {
    if (entities[raw]) return entities[raw];
    const numericMatch = raw.match(/&#(\d+);/);
    if (numericMatch) return String.fromCharCode(Number(numericMatch[1]));
    return raw;
  });
}

function extractBodyHtml(fullHtml) {
  const opener = '<div class="page-content clearfix">';
  const start = fullHtml.indexOf(opener);
  if (start === -1) return null;
  let depth = 1;
  let cursor = start + opener.length;
  while (depth > 0 && cursor < fullHtml.length) {
    const nextOpen = fullHtml.indexOf('<div', cursor);
    const nextClose = fullHtml.indexOf('</div>', cursor);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 4;
    } else {
      depth -= 1;
      cursor = nextClose + '</div>'.length;
      if (depth === 0) {
        return fullHtml.slice(start + opener.length, cursor - '</div>'.length);
      }
    }
  }
  return null;
}

function htmlToMarkdown(html) {
  let markdown = html;
  markdown = markdown.replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, '');
  markdown = markdown.replace(/<img[^>]*>/gi, '');
  markdown = markdown.replace(/<a[^>]*href=["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  markdown = markdown.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) =>
    `\n\n${'#'.repeat(Number(level))} ${content.trim()}\n\n`,
  );
  markdown = markdown.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  markdown = markdown.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  markdown = markdown.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, content) => `\n\n\`\`\`\n${content.replace(/<[^>]+>/g, '')}\n\`\`\`\n\n`);
  markdown = markdown.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  markdown = markdown.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = decodeEntities(markdown);
  markdown = markdown.replace(/[ \t]+\n/g, '\n');
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  return markdown.trim();
}

async function fetchAndParse(sourceUrl) {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const bodyHtml = extractBodyHtml(html);
  if (!bodyHtml) {
    throw new Error('page-content div not found');
  }
  const markdown = htmlToMarkdown(bodyHtml);
  if (markdown.length < 20) {
    throw new Error(`Parsed body too short (${markdown.length} chars)`);
  }
  return markdown;
}

const seedEntries = JSON.parse(await readFile(seedPath, 'utf8'));

let fetchedCount = 0;
let skippedCount = 0;
let failedCount = 0;

for (const entry of seedEntries) {
  if (typeof entry.body === 'string' && entry.body.length > 0) {
    console.log(`skip     ${entry.id} (body already present)`);
    skippedCount += 1;
    continue;
  }
  try {
    process.stdout.write(`fetching ${entry.id}... `);
    entry.body = await fetchAndParse(entry.sourceUrl);
    console.log(`ok (${entry.body.length} chars)`);
    fetchedCount += 1;
    await new Promise((wait) => setTimeout(wait, 750));
  } catch (error) {
    console.log(`failed — ${error.message}`);
    failedCount += 1;
  }
}

await writeFile(seedPath, `${JSON.stringify(seedEntries, null, 2)}\n`);
console.log(`\nDone. fetched=${fetchedCount} skipped=${skippedCount} failed=${failedCount}`);
