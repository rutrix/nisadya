// Site data: the live Google Sheet, the last good read of each tab in this server process, and the baked copy
// (src/data/baked.json). scripts/bake.mjs makes the baked copy for each build. Only the server uses this file.
import { cache } from 'react';
import baked from '@/data/baked.json';
import sheet from '../../sheet.json';
import { TABS, canOptimise, driveImage, hhmm, isFixed, isoDate, readTab, resolveTab, slug } from './core.mjs';

export const REVALIDATE = 60;
export const SITE_URL = 'https://nisadya.in';
/** The settings keys that decide the registration and event phase. */
export const PHASE_KEYS = ['registration_open', 'registration_close', 'event_start', 'event_end'];

type Rec = Record<string, string>;
type Tab = (typeof TABS)[number];

export type Settings = Record<string, string>;
export type Block = { date: string; start: string; end: string; venue: string; eventId: string; title: string };
export type EventItem = {
  index: number;
  id: string;
  name: string;
  /** The small line under the name on the text banner. */
  subtitle: string;
  category: string;
  keywords: string[];
  description: string;
  audience: string[];
  poster: string;
  unstopUrl: string;
  coordinators: string[];
  contact: string;
  blocks: Block[];
};
export type Faq = { category: string; question: string; answer: string };
export type DocSection = { heading: string; paragraphs: string[] };
export type Doc = { lead: string[]; sections: DocSection[] };
export type Contact = { group: string; name: string; phone: string };
export type Site = {
  settings: Settings;
  events: EventItem[];
  schedule: Block[];
  faq: Faq[];
  pages: Record<string, Doc>;
  contacts: Contact[];
};

const bakedTabs = baked.tabs as unknown as Record<string, Rec[]>;
// No prototype, so a sheet value such as "constructor" finds nothing here.
const bakedMedia: Record<string, string> = Object.assign(Object.create(null), baked.media);
/** The last good live read of each tab, for this server process. */
const lastGood = new Map<Tab, Rec[]>();
const TIMEOUT = 10_000;
// The published sheet ID stays out of git. App Hosting (console) and .env.local set SHEET_ID.
const SHEET_ID = process.env.SHEET_ID ?? '';
if (!SHEET_ID) console.error('sheet: SHEET_ID is not set, so the site uses the baked copy');

async function readLive(tab: Tab): Promise<Rec[] | null> {
  const gid = (sheet.gids as Record<string, string>)[tab];
  if (!SHEET_ID || !gid) return null;
  try {
    const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&gid=${gid}`;
    const read = fetch(url, { next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(TIMEOUT) }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // A sign-in or error page can arrive with status 200. The site trusts only a CSV reply.
      if (!res.headers.get('content-type')?.includes('text/csv')) throw new Error(`not CSV: ${res.headers.get('content-type')}`);
      return res.text();
    });
    // Next drops the signal when it refreshes a stale cache entry, so a timer also limits the read.
    const late = new Promise<never>((_, fail) => setTimeout(() => fail(new Error(`no reply in ${TIMEOUT / 1000} s`)), TIMEOUT).unref());
    const rows = readTab(tab, await Promise.race([read, late]));
    if (!rows) throw new Error('a required column is missing');
    lastGood.set(tab, rows);
    return rows;
  } catch (e) {
    console.error(`sheet: the site could not read the ${tab} tab, so it uses the last good read (or else the baked copy)`, e);
    return lastGood.get(tab) ?? null;
  }
}

/** An image address the site may show: the baked copy, a local file or a Drive image (as lh3 /d/<id>).
 * Anything else ("TBD", another website, http://) gives '', so the caller shows its own fallback. */
export const image = (url: string) => {
  const src = url ? (bakedMedia[url] ?? driveImage(url)) : '';
  return canOptimise(src) ? src : '';
};
/** The link preview image: the share_image setting, else the 1200 x 630 card in public/. */
export const shareImage = (s: Settings) => image(s.share_image ?? '') || '/share.png';
/** "Nisadya 2026": the event name and the edition, each only if the sheet has it. */
export const siteName = (s: Settings) => [s.event_name, s.edition].filter(Boolean).join(' ');

const lines = (v: string) =>
  (v ?? '')
    .split('\n')
    .map((l) => l.replace(/^\s*[-•·*]\s*/, '').trim())
    .filter(Boolean);
const list = (v: string) => (v ?? '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

export const getSite = cache(async (): Promise<Site> => {
  const raw = Object.fromEntries(
    await Promise.all(
      TABS.map(async (t) => {
        const b = bakedTabs[t] ?? [];
        return [t, isFixed(b) ? b : resolveTab(t, b, await readLive(t))];
      }),
    ),
  ) as Record<Tab, Rec[]>;

  const settings: Settings = {};
  for (const r of raw.settings) if (r.key) settings[r.key] = r.value ?? '';

  const schedule: Block[] = raw.schedule
    .map((r) => ({
      date: isoDate(r.date),
      start: hhmm(r.start),
      end: hhmm(r.end),
      venue: r.venue ?? '',
      eventId: slug(r.event_id ?? ''),
      title: r.title ?? '',
    }))
    .filter((b) => b.date && b.start && (b.eventId || b.title))
    .sort((a, b) => (a.date + a.start + a.venue).localeCompare(b.date + b.start + b.venue));

  const seen = new Set<string>();
  const events: EventItem[] = [];
  for (const r of raw.events) {
    const id = slug(r.id ?? '');
    if (!id || !r.name || seen.has(id)) continue;
    seen.add(id);
    events.push({
      index: events.length,
      id,
      name: r.name,
      subtitle: r.subtitle ?? '',
      category: r.category ?? '',
      keywords: list(r.keywords),
      description: r.description ?? '',
      audience: lines(r.audience),
      poster: image(r.poster_url ?? ''),
      unstopUrl: /^https:\/\//i.test(r.unstop_url ?? '') ? r.unstop_url : '',
      coordinators: list(r.coordinators),
      contact: r.contact ?? '',
      blocks: schedule.filter((b) => b.eventId === id),
    });
  }

  const faq = raw.faq
    .filter((r) => r.question && r.answer)
    .map((r) => ({ category: r.category || 'Questions', question: r.question, answer: r.answer }));

  const pages: Record<string, Doc> = Object.create(null); // no prototype: a page named "constructor" is safe
  for (const r of raw.pages) {
    const page = slug(r.page ?? '');
    if (!page || !r.text) continue;
    const doc = (pages[page] ??= { lead: [], sections: [] });
    const heading = r.heading ?? '';
    if (!heading) doc.lead.push(r.text);
    else {
      const last = doc.sections.at(-1);
      if (last?.heading === heading) last.paragraphs.push(r.text);
      else doc.sections.push({ heading, paragraphs: [r.text] });
    }
  }

  const contacts = raw.contacts
    .filter((r) => r.name)
    .map((r) => ({ group: r.group || 'Contacts', name: r.name, phone: r.phone ?? '' }));

  return { settings, events, schedule, faq, pages, contacts };
});
