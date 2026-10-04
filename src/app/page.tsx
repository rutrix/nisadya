import type { Metadata } from 'next';
import { EventRows } from '@/components/home/EventRows';
import { Faq } from '@/components/home/Faq';
import { Hero } from '@/components/home/Hero';
import { Venue } from '@/components/home/Venue';
import { Share } from '@/components/Share';
import { PHASE_KEYS, SITE_URL, getSite, siteName } from '@/lib/data';

export const revalidate = 60;
// This canonical link is on the home page, not in the layout, so other pages do not inherit it.
export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const { settings: s, events, faq } = await getSite();
  const name = siteName(s);
  const phase = Object.fromEntries(PHASE_KEYS.map((k) => [k, s[k] ?? '']));
  return (
    <>
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
