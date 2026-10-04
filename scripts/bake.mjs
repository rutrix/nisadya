// This build step (npm "prebuild" and "predev") copies the published sheet into src/data/baked.json.
// It also downloads the images of final rows into public/media/, so the site serves its own copies.
// Neither is in git (.gitignore). baked.json holds the whole sheet, with people's names and phone numbers,
// and git history is permanent. Each build bakes both again.
// If the bake cannot read the sheet, an existing baked.json stays. With none, a build stops (see notRead).
// Usage: node scripts/bake.mjs            read the sheet SHEET_ID (environment), with the gids in sheet.json
//        node scripts/bake.mjs --csv DIR  read DIR/<tab>.csv instead (a missing file makes the read untrusted)
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { TABS, driveDownload, driveId, isFinal, readTab, sniff } from '../src/lib/core.mjs';
import { sheetNames } from '../src/lib/privacy.mjs';

const root = path.resolve(import.meta.dirname, '..');
const OUT = path.join(root, 'src/data/baked.json');
const MEDIA = path.join(root, 'public/media');
const SETTINGS_MEDIA = /^share_image$/;
const EVENT_MEDIA = ['poster_url'];
const isHttps = (v) => /^https:\/\//i.test(v ?? '');

async function readTabs() {
  const i = process.argv.indexOf('--csv');
  if (i > 0) {
    const dir = process.argv[i + 1];
    return Object.fromEntries(
      await Promise.all(TABS.map(async (t) => [t, await readFile(path.join(dir, `${t}.csv`), 'utf8').catch(() => '')])),
    );
  }
  const { gids } = JSON.parse(await readFile(path.join(root, 'sheet.json'), 'utf8'));
  const publishedId = process.env.SHEET_ID; // App Hosting console, or .env.local (npm scripts)
  if (!publishedId) return null;
  return Object.fromEntries(
    await Promise.all(
      TABS.map(async (t) => {
        if (!gids[t]) return [t, '']; // a tab with no gid has no required columns, so the bake does not trust the read
        const url = `https://docs.google.com/spreadsheets/d/e/${publishedId}/pub?output=csv&gid=${gids[t]}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
        if (!res.ok) throw new Error(`${t}: HTTP ${res.status}`);
        // A sign-in or error page can arrive with status 200. The bake trusts only a CSV reply.
        if (!res.headers.get('content-type')?.includes('text/csv')) throw new Error(`${t}: not CSV`);
        return [t, await res.text()];
      }),
    ),
  );
}

// The bake copies only Drive files (the site shows no other image hosts). It refuses a file larger than 20 MB.
const MAX_BYTES = 20_000_000;
async function download(url) {
  if (!driveId(url)) throw new Error('not a Google Drive link, so the bake does not copy it');
  const res = await fetch(driveDownload(url), { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // A reply may have no Content-Length, so count the bytes as they arrive.
  const chunks = [];
  let size = 0;
  for await (const chunk of res.body) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error(`larger than ${MAX_BYTES / 1e6} MB`);
    chunks.push(chunk);
  }
  const buf = new Uint8Array(Buffer.concat(chunks));
  const ext = sniff(buf);
  if (!ext) throw new Error('not an image. Share the Drive file as "Anyone with the link" (files over 100 MB do not download)');
  const name = createHash('sha1').update(buf).digest('hex').slice(0, 16) + ext;
  await writeFile(path.join(MEDIA, name), buf);
  return `/media/${name}`;
}

// The bake could not read the sheet, or it did not trust the read. An existing baked.json stays. With no
// baked.json, a build (npm "prebuild") stops. App Hosting then continues to serve the last good rollout and
// does not deploy an empty site. Run the rollout again when the sheet is readable. Other commands (npm run
// dev, npm run bake) get an empty baked.json, and the site then shows only the live sheet.
async function notRead(reason) {
  if (await readFile(OUT).then(() => true, () => false)) {
    console.warn(`bake: ${reason}. The existing baked.json stays.`);
    process.exit(0);
  }
  if (process.env.npm_lifecycle_event === 'prebuild') {
    console.error(`bake: ${reason}, and there is no baked.json. The build stops, so the last good rollout continues to serve the site.`);
    process.exit(1);
  }
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ tabs: {}, media: {} }) + '\n');
  console.warn(`bake: ${reason}. baked.json is new and empty.`);
  process.exit(0);
}

// next build serves a cached sheet that may be stale, and Next drops the fetch timeout when it refreshes a
// stale entry. Remove that cache, so every build reads the sheet afresh and the timeout in data.ts applies.
await rm(path.join(root, '.next/cache/fetch-cache'), { recursive: true, force: true });

let texts;
try {
  texts = await readTabs();
} catch (e) {
  await notRead(`the bake could not read the sheet (${e.message})`);
}
if (!texts) await notRead('SHEET_ID is not set (App Hosting console, or .env.local)');
const tabs = Object.fromEntries(TABS.map((t) => [t, readTab(t, texts[t])]));
const bad = TABS.filter((t) => !tabs[t]);
if (bad.length) await notRead(`a required column is missing in ${bad.join(', ')}, so the bake does not trust the read`);
if (tabs.settings.length === 0) await notRead('the settings tab is empty, so the bake does not trust the read');

// The local pre-commit hook blocks a commit that contains one of these names. The list stays inside
// .git, which git never commits. The list only grows. Without a .git folder, the bake skips this step.
if (await readFile(path.join(root, '.git', 'HEAD')).then(() => true, () => false)) {
  const file = path.join(root, '.git', 'private-names.txt');
  const old = (await readFile(file, 'utf8').catch(() => '')).split('\n').filter(Boolean);
  await writeFile(file, [...new Set([...old, ...sheetNames(tabs)])].sort().join('\n') + '\n');
}

const wanted = new Set();
for (const r of tabs.settings) if (isFinal(r.final) && SETTINGS_MEDIA.test(r.key) && isHttps(r.value)) wanted.add(r.value);
for (const r of tabs.events) if (isFinal(r.final)) for (const f of EVENT_MEDIA) if (isHttps(r[f])) wanted.add(r[f]);

await mkdir(MEDIA, { recursive: true });
const media = {};
let failed = 0;
for (const url of wanted) {
  try {
    media[url] = await download(url);
  } catch (e) {
    failed++;
    console.error(`bake: ${url}: ${e.message}`);
  }
}
const kept = new Set(Object.values(media));
for (const f of await readdir(MEDIA)) if (!kept.has(`/media/${f}`)) await rm(path.join(MEDIA, f));

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ tabs, media }, null, 1) + '\n');
const counts = TABS.map((t) => `${t} ${tabs[t].length}`).join(', ');
console.log(`bake: ${counts}. It saved ${kept.size} media files${failed ? `, and ${failed} failed` : ''}.`);
