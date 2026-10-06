import Link from 'next/link';
import type { EventItem } from '@/lib/data';
import { EventCard } from '../EventCard';

/** One marquee row. It holds its cards twice, so the loop has no visible jump. It hides the copy (aria-hidden). */
function Row({ events, dir }: { events: EventItem[]; dir: 'left' | 'right' }) {
  let cards = events;
  while (cards.length < 6) cards = cards.concat(events); // one copy must be wider than the widest screen
  const seconds = cards.length * 3.3; // the reference speed: about 3.3 s per card
  return (
    <div className="marquee-row overflow-hidden overflow-clip py-1">
      <div
        className="marquee-track flex w-max"
        data-direction={dir === 'right' ? 'reverse' : undefined}
        style={{ '--marquee-duration': `${seconds}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex gap-2 pr-2" aria-hidden={copy === 1 || undefined}>
            {cards.map((e, i) => {
              const duplicate = copy === 1 || i >= events.length;
              return (
                <li key={i} aria-hidden={duplicate || undefined}>
                  <EventCard e={e} variant="marquee" duplicate={duplicate} />
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}

// The round control, styled like the theme button. The focus ring shows on the circle, because the checkbox is hidden.
const CIRCLE =
  'grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-fg ring-2 ring-brand-fg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus lg:h-[50px] lg:w-[50px]';

export function EventRows({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;
  const half = Math.ceil(events.length / 2);
  const rows = [events.slice(0, half), events.slice(half)].filter((r) => r.length);
  return (
    // mt-2 and the row padding (py-1) leave 12 px above the first card, the same gap as between the two rows.
    <section aria-labelledby="events-title" className="mt-2">
      <h2 id="events-title" className="sr-only">
        Events
      </h2>
      <a href="#all-events" className="sr-only focus:not-sr-only focus:mx-4 focus:mb-2 focus:inline-block focus:font-semibold">
        Skip the event rows
      </a>
      <div className="relative flex flex-col gap-1">
        {/* WCAG 2.2.2: moving content needs a pause control. It sits on the seam between the rows. The page hides it
            when the visitor's settings request reduced motion. The title of the visible icon gives the hover text. */}
        <label className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer motion-reduce:hidden">
          <input type="checkbox" className="marquee-pause peer sr-only" aria-label="Pause the event rows" />
          <span aria-hidden title="Pause the event rows" className={`${CIRCLE} peer-checked:hidden`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            </svg>
          </span>
          <span aria-hidden title="Play the event rows" className={`${CIRCLE} hidden peer-checked:grid`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="currentColor" d="M8.5 5.5v13l10.5-6.5z" />
            </svg>
          </span>
        </label>
        {rows.map((r, i) => (
          <Row key={i} events={r} dir={i === 0 ? 'left' : 'right'} />
        ))}
      </div>
      <div className="flex justify-center px-4 pb-[100px] pt-20 lg:pb-[200px]">
        <Link id="all-events" href="/events" className="btn-primary h-[70px] w-full max-w-[320px] text-xl">
          View all events
        </Link>
      </div>
    </section>
  );
}
