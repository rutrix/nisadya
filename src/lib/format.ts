import { istTime } from './core.mjs';
import type { Block } from './data';

const IST = 'Asia/Kolkata';
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...o });
const dMY = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const dM = fmt({ day: 'numeric', month: 'long' });
const MY = fmt({ month: 'long', year: 'numeric' });
const Y = fmt({ year: 'numeric' });
const d = fmt({ day: 'numeric' });
const short = fmt({ weekday: 'short', day: 'numeric', month: 'short' });

/** "13–14 November 2026", "30 October – 2 November 2026", "30 December 2026 – 2 January 2027" or "13 November 2026". */
export function dateRange(start: string, end?: string) {
  const a = istTime(start);
  if (a === null) return '';
  const b = istTime(end ?? '');
  // The same calendar day (a start time may make the two moments differ) gives one date.
  if (b === null || dMY.format(b) === dMY.format(a)) return dMY.format(a);
  if (Y.format(a) !== Y.format(b)) return `${dMY.format(a)} – ${dMY.format(b)}`;
  return MY.format(a) === MY.format(b) ? `${d.format(a)}–${dMY.format(b)}` : `${dM.format(a)} – ${dMY.format(b)}`;
}

/** "Fri, 13 Nov" for a schedule date (YYYY-MM-DD). */
export const shortDay = (date: string) => {
  const t = istTime(date);
  return t === null ? date : short.format(t);
};

const hm = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
/** "15:00 on Fri, 13 Nov" for a moment (epoch ms). */
export const timeOn = (ms: number) => `${hm.format(ms)} on ${short.format(ms)}`;

/** A schedule slot on one line: "Fri, 13 Nov · 12:00–15:00 · DoMS LH1". The caller shows the title. */
export const slotText = (b: Block) => [shortDay(b.date), b.end ? `${b.start}–${b.end}` : b.start, b.venue].filter(Boolean).join(' · ');
