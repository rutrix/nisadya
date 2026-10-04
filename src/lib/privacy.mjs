// @ts-check
// People's names, phone numbers and email addresses must never reach the public repo: git history is
// permanent. The pre-commit hook (.githooks/pre-commit) blocks a commit with findPrivate, and
// scripts/bake.mjs keeps the hook's list of names with sheetNames. Node only: the site never imports
// this file, because older Safari cannot parse the lookbehind in PHONE_RE.

/** Text that may stay: the fest's own address, and the Firebase project ID (it looks like a phone number). */
export const PRIVACY_ALLOW = ['nisadya@nitt.edu', 'studio-6468512058-1f678'];

export const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

// Indian mobile (optional +91 or 0), any number written with a leading + and 8 to 15 digits, and Indian
// landline with STD code. A match is never part of a longer word or number, so dates, times, coordinates
// and Drive IDs do not match.
export const PHONE_RE = new RegExp(
  [String.raw`(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}`, String.raw`\+\d(?:[\s-]?\d){7,14}`, String.raw`0\d{2,4}[\s-]?\d{6,8}`]
    .map((p) => String.raw`(?<![\w+])(?:${p})(?!\w)`)
    .join('|'),
  'g',
);

// A published Google Sheet ID. Anyone with it can read every published tab, so it stays in SHEET_ID.
export const SHEET_ID_RE = /2PACX-[\w-]{20,}/;

/** @param {string} s @param {string[]} allow */
const hide = (s, allow) => allow.reduce((t, a, i) => t.split(a).join(`\u0000${i}\u0000`), s);

/** The kinds of private data in one line of text: 'email', 'phone', 'name' (a name from `names`) and 'sheet-id'.
 * The function skips inline data: URIs (base64 images). @param {string} line @param {string[]} names
 * @param {string[]} [allow] @returns {string[]} */
export function findPrivate(line, names, allow = PRIVACY_ALLOW) {
  const s = hide(line.replace(/data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+/g, ' '), allow);
  const kinds = [];
  if (s.match(EMAIL_RE)) kinds.push('email');
  if (s.match(PHONE_RE)) kinds.push('phone');
  if (SHEET_ID_RE.test(s)) kinds.push('sheet-id');
  const low = s.toLowerCase();
  if (names.some((n) => new RegExp(String.raw`(?<!\w)${n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\w)`).test(low))) kinds.push('name');
  return kinds;
}

/** People's names in the sheet: the events coordinators column and the contacts tab name column.
 * @param {Record<string, Record<string, string>[]>} tabs @returns {string[]} */
export function sheetNames(tabs) {
  const split = (/** @type {string} */ v) => String(v ?? '').split(/[,\n]/).map((x) => x.trim()).filter((x) => x.length >= 3);
  return [...new Set([...(tabs.events ?? []).flatMap((r) => split(r.coordinators)), ...(tabs.contacts ?? []).flatMap((r) => split(r.name))])];
}
