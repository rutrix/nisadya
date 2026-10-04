import { istTime } from './core.mjs';

const IST = 'Asia/Kolkata';
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...o });
const dMY = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const dM = fmt({ day: 'numeric', month: 'long' });
const d = fmt({ day: 'numeric' });
const short = fmt({ weekday: 'short', day: 'numeric', month: 'short' });

/** "13–14 November 2026", "30 October – 2 November 2026" or "13 November 2026". */
export function dateRange(start: string, end?: string) {
  const a = istTime(start);
  if (a === null) return '';
  const b = istTime(end ?? '');
  // The same calendar day (a start time may make the two moments differ) gives one date.
  if (b === null || dMY.format(b) === dMY.format(a)) return dMY.format(a);
  const sameMonth = dM.format(a).split(' ')[1] === dM.format(b).split(' ')[1];
  return sameMonth ? `${d.format(a)}–${dMY.format(b)}` : `${dM.format(a)} – ${dMY.format(b)}`;
}

/** "Fri, 13 Nov" for a schedule date (YYYY-MM-DD). */
export const shortDay = (date: string) => {
  const t = istTime(date);
  return t === null ? date : short.format(t);
};
