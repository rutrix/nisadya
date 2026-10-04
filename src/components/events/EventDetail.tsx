import Image from 'next/image';
import { Clock } from 'lucide-react';
import { canOptimise, isEmail } from '@/lib/core.mjs';
import { PHASE_KEYS, SITE_URL, siteName, type EventItem, type Site } from '@/lib/data';
import { dateRange, shortDay } from '@/lib/format';
import { Chips, EventCard, accentOf } from '../EventCard';
import { RichText } from '../RichText';
import { Share } from '../Share';
import { DetailClose, DetailRegister } from './DetailParts';
import { EventBanner } from './EventBanner';

/** Up to 4: most shared keywords first, then the same category, then list order. */
function related(e: EventItem, all: EventItem[]) {
  const score = (o: EventItem) => o.keywords.filter((k) => e.keywords.includes(k)).length * 10 + (o.category && o.category === e.category ? 1 : 0);
  return all
    .filter((o) => o.id !== e.id)
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s || a.o.index - b.o.index)
    .slice(0, 4)
    .map((x) => x.o);
}

const contactHref = (c: string) =>
  isEmail(c) ? `mailto:${c}` : /^\+?[\d\s-]{7,}$/.test(c) ? `tel:${c.replace(/[\s-]/g, '')}` : '';

export function EventDetail({ e, site, mode, serverNow }: { e: EventItem; site: Site; mode: 'page' | 'modal'; serverNow: number }) {
  const s = site.settings;
  const a = accentOf(e);
  const Title = mode === 'page' ? 'h1' : 'h2';
  const hasChips = Boolean(e.category || e.keywords.length);
  const phase = Object.fromEntries(PHASE_KEYS.map((k) => [k, s[k] ?? '']));
  const more = related(e, site.events);
  const href = contactHref(e.contact);

  return (
    <article aria-labelledby="event-title" className="relative w-full bg-bg lg:max-w-detail">
      <DetailClose mode={mode} />
      <div className="flex flex-col gap-5 px-5 py-[30px] lg:gap-10 lg:p-10">
        <header className={`flex flex-col gap-2.5 lg:gap-[15px] ${hasChips ? '' : 'pt-[35px] lg:pt-10'}`}>
          <div className="pr-12 lg:pr-[200px]">
            <Chips e={e} />
          </div>
          <Title id="event-title" className="text-xl font-bold leading-[30px] lg:text-[32px] lg:leading-[48px]">
            {e.name}
          </Title>
          <ul className={`flex flex-col gap-1 text-sm font-semibold leading-[21px] lg:text-base lg:leading-6 ${a.text}`}>
            {(e.blocks.length ? e.blocks : [null]).map((b, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <Clock className="h-[13px] w-[13px] shrink-0 lg:h-[17px] lg:w-[17px]" aria-hidden />
                {b
                  ? [shortDay(b.date), b.end ? `${b.start}–${b.end}` : b.start, b.venue].filter(Boolean).join(' · ')
                  : `${dateRange(s.event_start, s.event_end)} · Time to be announced`}
              </li>
            ))}
          </ul>
        </header>

        {/* A banner image from the sheet wins. Without one, the text banner shows. */}
        {e.poster ? (
          <div className="flex justify-center bg-surface-faint">
            <Image
              src={e.poster}
              alt={`${e.name} banner`}
              width={1080}
              height={1080}
              sizes="(min-width: 1080px) 720px, 100vw"
              unoptimized={!canOptimise(e.poster)}
              className="h-auto max-h-[560px] w-auto max-w-full"
            />
          </div>
        ) : (
          <EventBanner e={e} />
        )}

        {(e.description || e.audience.length > 0) && (
          <div className="flex flex-col gap-5">
            {e.description && (
              <RichText text={e.description} className="flex flex-col gap-3 text-sm font-semibold leading-[21px] text-fg-subtle lg:text-base lg:leading-6" />
            )}
            {e.audience.length > 0 && (
              <div className="flex flex-col gap-2 bg-surface-faint px-4 py-3 lg:grid lg:grid-cols-[120px_1fr] lg:gap-4 lg:px-6 lg:py-5">
                <p className="text-[13px] font-bold text-fg-subtle lg:text-base">Who should enter</p>
                <ul className="list-disc pl-5 text-[13px] font-semibold leading-[18.2px] lg:text-base lg:leading-6">
                  {e.audience.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <DetailRegister s={phase} serverNow={serverNow} url={e.unstopUrl || s.registration_url} />
          <Share url={`${SITE_URL}/events/${e.id}`} title={`${e.name} | ${siteName(s)}`} variant="detail" />
        </div>
      </div>

      {(e.coordinators.length > 0 || e.contact) && (
        <section aria-labelledby="people-title" className={`px-5 py-[30px] text-black lg:p-10 ${a.base}`}>
          <h2 id="people-title" className="text-[13px] font-bold lg:text-base">
            {e.coordinators.length > 1 ? 'Coordinators' : 'Coordinator'}
          </h2>
          <ul className="mt-3 flex flex-col gap-1">
            {e.coordinators.map((c) => (
              <li key={c} className="text-lg font-bold lg:text-xl">
                {c}
              </li>
            ))}
          </ul>
          {e.contact && (
            <p className="mt-3 font-semibold">
              Contact: {href ? <a href={href} className="underline underline-offset-4">{e.contact}</a> : e.contact}
            </p>
          )}
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="related-title" className="py-[30px] lg:py-10">
          <h2 id="related-title" className="px-5 text-xl font-bold leading-[30px] lg:px-10 lg:text-[32px] lg:leading-[48px]">
            More events
          </h2>
          <ul className="mt-4 flex gap-2.5 overflow-x-auto px-5 pb-2 lg:px-10">
            {more.map((o) => (
              <li key={o.id} className="w-[220px] shrink-0">
                <EventCard e={o} variant="board" hard={mode === 'page'} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
