import Link from 'next/link';
import type { EventItem } from '@/lib/data';
import { shortDay } from '@/lib/format';
import { BannerText } from './BannerText';

/** Complete class names, so Tailwind keeps them. The colours are in globals.css. */
export const ACCENTS = [
  { base: 'bg-a1-base', tag: 'bg-a1-tag', tint: 'bg-a1-tint text-a1-tag', text: 'text-a1-text' },
  { base: 'bg-a2-base', tag: 'bg-a2-tag', tint: 'bg-a2-tint text-a2-tag', text: 'text-a2-text' },
  { base: 'bg-a3-base', tag: 'bg-a3-tag', tint: 'bg-a3-tint text-a3-tag', text: 'text-a3-text' },
  { base: 'bg-a4-base', tag: 'bg-a4-tag', tint: 'bg-a4-tint text-a4-tag', text: 'text-a4-text' },
];
export const accentOf = (e: { index: number }) => ACCENTS[e.index % ACCENTS.length];

export function Chips({ e, home = false }: { e: EventItem; home?: boolean }) {
  const a = accentOf(e);
  const chip = `px-1.5 py-1 text-xs ${home ? 'leading-[16.8px]' : 'leading-[15px]'}`;
  if (!e.category && e.keywords.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Topics">
      {e.category && <li className={`${chip} ${a.tag} font-bold text-white`}>{e.category}</li>}
      {e.keywords.slice(0, 2).map((k) => (
        <li key={k} className={`${chip} ${a.tint} font-medium`}>
          {k}
        </li>
      ))}
    </ul>
  );
}

/** First schedule block of an event, e.g. "Fri, 13 Nov · 10:00 · Seminar Hall". */
export const firstSlot = (e: EventItem) => {
  const b = e.blocks[0];
  return b ? [shortDay(b.date), b.start, b.venue].filter(Boolean).join(' · ') : '';
};

const SIZES = {
  marquee: 'h-[240px] w-[300px] p-5 md:h-[280px] md:w-[420px] [@media(hover:hover)]:hover:opacity-90 transition-opacity duration-fast ease-out',
  board: 'min-h-[200px] p-[15px] lg:h-[222px] xl:h-[220px]',
};
const TITLES = {
  marquee: 'flex flex-1 flex-col justify-center [container-type:inline-size]', // name and subtitle centred, as on the event banner
  board: 'text-lg font-bold leading-[27px] lg:line-clamp-3 lg:text-[15px] lg:leading-[22.5px]',
};

/** A whole-card link to the event. A duplicate card (a marquee copy) gets tabIndex -1, so the keyboard skips it.
 * EventRows hides it from screen readers.
 * `hard` uses a plain link, so a full event page opens the next event in place, not as a dialog. */
export function EventCard({ e, variant, duplicate = false, note, hard = false }: { e: EventItem; variant: keyof typeof SIZES; duplicate?: boolean; note?: string; hard?: boolean }) {
  const slot = note ?? firstSlot(e);
  return (
    <article className={`relative flex flex-col gap-3 text-black ${accentOf(e).base} ${SIZES[variant]}`}>
      <Chips e={e} home={variant === 'marquee'} />
      <h3 className={TITLES[variant]}>
        {hard ? (
          <a href={`/events/${e.id}`} className="after:absolute after:inset-0">
            {e.name}
          </a>
        ) : (
          <Link href={`/events/${e.id}`} scroll={false} tabIndex={duplicate ? -1 : undefined} className="after:absolute after:inset-0">
            {variant === 'marquee' ? (
              <>
                <span className="sr-only">{e.subtitle ? `${e.name}, ${e.subtitle}` : e.name}</span>
                <BannerText e={e} />
              </>
            ) : (
              e.name
            )}
          </Link>
        )}
      </h3>
      {slot && <p className="mt-auto truncate text-[13px] font-bold">{slot}</p>}
    </article>
  );
}
