import type { Metadata } from 'next';
import { EventRows } from '@/components/home/EventRows';
import { Faq } from '@/components/home/Faq';
import { Hero } from '@/components/home/Hero';
import { Venue } from '@/components/home/Venue';
import { Share } from '@/components/Share';
import { schemaDate } from '@/lib/core.mjs';
import { PHASE_KEYS, SITE_URL, getSite, shareImage, siteName, venueAddress, type Settings } from '@/lib/data';

export const revalidate = 60;
// This canonical link is on the home page, not in the layout, so other pages do not inherit it.
export const metadata: Metadata = { alternates: { canonical: '/' } };

/** schema.org Event for search engines (https://schema.org/Event), from the sheet settings. Without a start date: none. */
function eventData(s: Settings, name: string) {
  const startDate = schemaDate(s.event_start ?? '');
  if (!startDate) return null;
  const address = venueAddress(s);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description: s.description || undefined,
    startDate,
    endDate: schemaDate(s.event_end ?? '') || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: s.venue_name || undefined,
      address: address ? { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'IN' } : undefined,
    },
    organizer: s.organiser
      ? { '@type': 'Organization', name: s.organiser, url: /^https:\/\//i.test(s.organiser_url ?? '') ? s.organiser_url : undefined }
      : undefined,
    image: [new URL(shareImage(s), SITE_URL).href],
    url: `${SITE_URL}/`,
  };
}

export default async function Home() {
  const { settings: s, events, faq } = await getSite();
  const name = siteName(s);
  const phase = Object.fromEntries(PHASE_KEYS.map((k) => [k, s[k] ?? '']));
  const ld = eventData(s, name);
  return (
    <>
      {/* The sheet text is escaped: a "<" in a cell cannot close this script tag. */}
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />}
      <Hero s={s} name={name} phase={phase} serverNow={Date.now()} />
      <EventRows events={events} />
      <Venue s={s} />
      <Faq faq={faq} />
      <section aria-labelledby="share-title" className="flex flex-col items-center gap-10 px-4 pb-[100px] text-center md:pb-[200px]">
        <h2 id="share-title" className="text-2xl font-bold leading-9 md:text-[40px] md:leading-[52px]">
          Share {name}
          <br className="md:hidden" /> with your friends
        </h2>
        <Share url={`${SITE_URL}/`} title={s.tagline ? `${name}: ${s.tagline}` : name} variant="home" />
      </section>
    </>
  );
}
