// @ts-check
// Pure helpers shared by scripts/bake.mjs (plain Node), scripts/check.mjs and the site.
// No imports, so every caller can load this file as it is.

export const TABS = /** @type {const} */ (['settings', 'events', 'schedule', 'faq', 'pages', 'contacts']);

const DAY = 86_400_000;

/** CSV text to rows of cells (RFC 4180 quoting). The function drops rows with no text in any cell.
 * @param {string} text @returns {string[][]} */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/** The header row gives lower-case keys. Each later row becomes an object of trimmed strings.
 * @param {string[][]} rows @returns {Record<string, string>[]} */
export function toRecords(rows) {
  const [head = [], ...body] = rows;
  const keys = head.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()]).filter(([k]) => k)));
}

/** The columns that each tab must have. @type {Record<string, string[]>} */
const REQUIRED = { settings: ['key', 'value'], events: ['id', 'name'], schedule: ['date', 'start'], faq: ['question', 'answer'], pages: ['page', 'text'], contacts: ['name'] };

/** The records of one tab, or null when its header row lacks a required column
 * (an empty reply, a renamed header, a row above the header). A header with no rows is a valid empty tab.
 * @param {string} tab @param {string} text @returns {Record<string, string>[] | null} */
export function readTab(tab, text) {
  const rows = parseCSV(text);
  const head = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  return (REQUIRED[tab] ?? []).every((k) => head.includes(k)) ? toRecords(rows) : null;
}

/** True for a plain email address (no spaces, no query such as ?bcc=). @param {string} v */
export const isEmail = (v) => /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(String(v ?? ''));

/** @param {unknown} v */
export const isFinal = (v) => /^(true|yes|y|1)$/i.test(String(v ?? '').trim());

/** An id or a page name as a URL slug: "Case Study 1" gives "case-study-1". @param {string} v */
export const slug = (v) => String(v ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** The cells that name a row in each tab, in the form that the site uses. Rows with the same name form one
 * group, for example the paragraphs under one page heading. @type {Record<string, (r: Record<string, string>) => string>} */
const ROW_NAME = {
  settings: (r) => r.key ?? '',
  events: (r) => slug(r.id),
  schedule: (r) => [isoDate(r.date), hhmm(r.start), r.venue ?? '', slug(r.event_id), r.title ?? ''].join('|'),
  faq: (r) => r.question ?? '',
  pages: (r) => [slug(r.page), r.heading ?? ''].join('|'),
  contacts: (r) => [r.group ?? '', r.name ?? ''].join('|'),
};

/** The rows the site uses for one tab.
 * A group with a final row comes whole from the baked copy, so the site never reads a final row live. The group
 * takes the place of its first live row, or goes to the end when the live sheet lacks it. Every other row comes
 * from the live sheet. When live is null, the function returns the baked rows. When live is empty, it returns
 * the baked rows for settings, and only the final groups for the other tabs.
 * @param {string} tab @param {Record<string, string>[]} baked @param {Record<string, string>[] | null} live */
export function resolveTab(tab, baked, live) {
  if (!live) return baked;
  if (tab === 'settings' && live.length === 0) return baked;
  const name = ROW_NAME[tab];
  /** @type {Map<string, Record<string, string>[]>} */
  const groups = new Map();
  for (const r of baked) groups.set(name(r), [...(groups.get(name(r)) ?? []), r]);
  const fixed = new Map([...groups].filter(([, rows]) => rows.some((r) => isFinal(r.final))));
  if (fixed.size === 0) return live;
  /** @type {Record<string, string>[]} */
  const out = [];
  for (const r of live) {
    const rows = fixed.get(name(r));
    if (!rows) out.push(r);
    else if (rows.length) out.push(...rows.splice(0)); // the first live row of the group; later ones get []
  }
  for (const rows of fixed.values()) out.push(...rows);
  return out;
}

/** True when the site must not read this tab live.
 * @param {Record<string, string>[]} baked */
export const isFixed = (baked) => baked.length > 0 && baked.every((r) => isFinal(r.final));

const pad = (/** @type {string | number} */ n) => String(n).padStart(2, '0');

/** "HH:MM" from "9:30", "09:30:00" or "2:30 PM". It returns "" when the value is not a time.
 * @param {string} v */
export function hhmm(v) {
  const m = String(v ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?$/i);
  if (!m) return '';
  let h = Number(m[1]);
  if (m[3]) h = (h % 12) + (/^p/i.test(m[3]) ? 12 : 0);
  return h < 24 && Number(m[2]) < 60 ? `${pad(h)}:${m[2]}` : '';
}

/** "YYYY-MM-DD" from "2026-11-13" or "13/11/2026" (the India locale export). Otherwise it returns "".
 * @param {string} v */
export function isoDate(v) {
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}` : '';
}

/** Epoch ms of a date (and optional time) as India time. The server runs in UTC, so the
 * offset is always explicit. @param {string} v @param {string} [defaultTime] @returns {number | null} */
export function istTime(v, defaultTime = '00:00') {
  const date = isoDate(v);
  if (!date) return null;
  const time = hhmm(String(v).trim().split(/[ T]/).slice(1).join(' ')) || defaultTime;
  const t = Date.parse(`${date}T${time}:00+05:30`);
  return Number.isNaN(t) ? null : t;
}

/** @param {string} url */
export function driveId(url) {
  const m = String(url ?? '').match(/(?:drive\.google\.com|googleusercontent\.com)\/.*?(?:\/d\/|[?&]id=)([\w-]{10,})/);
  return m ? m[1] : null;
}

/** True when the Next image optimiser may fetch this source: a local path ("/x", not "//host")
 * or a Drive image as lh3 /d/<id>. It must match images.remotePatterns in next.config.js.
 * @param {string} src */
export const canOptimise = (src) => /^\/(?![/\\])|^https:\/\/lh3\.googleusercontent\.com\/d\//.test(src);

/** A Drive link as a direct image address. The function returns other links unchanged. @param {string} url */
export function driveImage(url) {
  const id = driveId(url);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
}

/** A Drive link as a download address (used by the bake). @param {string} url */
export function driveDownload(url) {
  const id = driveId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

/**
 * The registration and event phase at a moment.
 * - soon: registration not open yet, or no registration_open date. Countdown to the event start.
 * - open: registration open. Countdown to its close, else to the event start.
 * - closed: registration over, event not started. Countdown to the event start.
 * - live: during the event. ended: after the last day.
 * Dates are whole days in India time. A close date is the last open day (the function ignores any time in the cell).
 * The event starts at 09:00 IST unless `event_start` gives a time, as on the old site.
 * @param {number} now @param {Record<string, string>} s
 */
export function phaseAt(now, s) {
  const regOpen = istTime(s.registration_open ?? '');
  const lastDay = istTime(isoDate(s.registration_close ?? ''));
  const regClose = lastDay === null ? null : lastDay + DAY;
  const start = istTime(s.event_start ?? '', '09:00');
  const endDay = istTime(isoDate(s.event_end || s.event_start || ''));
  const end = endDay === null ? null : endDay + DAY;

  if (end !== null && now >= end) return { phase: 'ended', target: null };
  if (start !== null && now >= start) return { phase: 'live', target: null };
  if (regClose !== null && now >= regClose) return { phase: 'closed', target: start };
  if (regOpen === null) return { phase: 'soon', target: start };
  if (now < regOpen) return { phase: 'soon', target: start, opensAt: regOpen };
  return { phase: 'open', target: regClose ?? start, closes: regClose !== null };
}

/** The venue_places setting: one "Name | lat, lon" line per place, with an optional
 * "| left", "| above" or "| below" for the label (right otherwise). The function skips bad lines.
 * @param {string} text @returns {{ name: string, lat: number, lon: number, side: string }[]} */
export function parsePlaces(text) {
  return String(text ?? '')
    .split('\n')
    .flatMap((line) => {
      const [name, at = '', side = ''] = line.split('|').map((p) => p.trim());
      const m = at.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
      if (!name || !m) return [];
      const s = side.toLowerCase();
      return [{ name, lat: Number(m[1]), lon: Number(m[2]), side: ['left', 'above', 'below'].includes(s) ? s : 'right' }];
    });
}

/** Position of a point on a map with linear bounds, in percent of its width and height, or null outside it.
 * @param {{ north: number, south: number, east: number, west: number }} b @param {number} lat @param {number} lon */
export function placeOnMap(b, lat, lon) {
  const x = ((lon - b.west) / (b.east - b.west)) * 100;
  const y = ((b.north - lat) / (b.north - b.south)) * 100;
  return x >= 0 && x <= 100 && y >= 0 && y <= 100 ? { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 } : null;
}

// Banner text in Aoboshi One. Width estimate: 0.8 em a letter and 0.28 em a space. The capitals average
// 0.72 em, and W is 1.0 em. Thus a line that fills 88% of the box in the estimate fills about 80% on screen.
const emOf = (/** @type {string} */ s) => [...s].reduce((n, c) => n + (c === ' ' ? 0.28 : 0.8), 0) || 1;

/** Font size in cqw (percent of the box width) that fits one line into 88% of the box, at most `cap`.
 * @param {string} s @param {number} cap */
export const fitLine = (s, cap) => Math.round(Math.min(cap, 88 / emOf(s)) * 100) / 100;

/** Lines and size (cqw) of a banner title. A title under 10cqw on one line splits at the space nearest its middle.
 * @param {string} text @param {number} [cap] @returns {{ lines: string[], size: number }} */
export function fitTitle(text, cap = 16) {
  const t = String(text ?? '').trim().replace(/\s+/g, ' ');
  const one = fitLine(t, cap);
  const spaces = [...t.matchAll(/ /g)].map((m) => m.index ?? 0);
  if (one >= 10 || spaces.length === 0) return { lines: [t], size: one };
  const mid = t.length / 2;
  const at = spaces.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a));
  const lines = [t.slice(0, at), t.slice(at + 1)];
  return { lines, size: Math.min(...lines.map((l) => fitLine(l, cap))) };
}

/** Google Maps directions to a point. The function builds it from two numbers only, so sheet text never reaches the URL.
 * @param {number} lat @param {number} lon */
export const directionsUrl = (lat, lon) => `https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lon)}`;

/** Kind of a downloaded file from its first bytes, or null (HTML, unknown). Drive can
 * return an HTML page instead of the file, so the bake checks the first bytes, not the content type.
 * @param {Uint8Array} b */
export function sniff(b) {
  const head = String.fromCharCode(...b.slice(0, 512));
  if (head.startsWith('\u0089PNG')) return '.png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return '.jpg';
  if (head.startsWith('GIF8')) return '.gif';
  if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return '.webp';
  // HEIC also starts with ftyp but is not a web format: refuse it.
  if (head.slice(4, 8) === 'ftyp' && /^avi[fs]$/.test(head.slice(8, 12))) return '.avif';
  if (!/<html|<!doctype html/i.test(head) && /<svg[\s>]/i.test(head)) return '.svg';
  return null;
}
