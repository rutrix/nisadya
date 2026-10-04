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

export function EventRows({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;
  const half = Math.ceil(events.length / 2);
  const rows = [events.slice(0, half), events.slice(half)].filter((r) => r.length);
  return (
    <section aria-labelledby="events-title">
      <h2 id="events-title" className="sr-only">
        Events
      </h2>
      <a href="#all-events" className="sr-only focus:not-sr-only focus:mx-4 focus:mb-2 focus:inline-block focus:font-semibold">
        Skip the event rows
      </a>
      {/* WCAG 2.2.2: moving content needs a pause control. The page hides the control when the visitor's settings request reduced motion. */}
      <label className="mb-2 ml-auto mr-4 flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold motion-reduce:hidden">
        <input type="checkbox" className="marquee-pause h-4 w-4" />
        Pause the event rows
      </label>
      <div className="flex flex-col gap-1">
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
