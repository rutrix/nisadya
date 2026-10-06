import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/events/EventDetail';
import { getSite } from '@/lib/data';

// Next renders this page for each visit. Thus a new event in the sheet gets its page without a build, and a
// request for an unknown id stores nothing on the server. Next keeps each sheet response in its data cache for
// 60 s (src/lib/data.ts). After that time, each visit reads the sheet again until the first refresh completes.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { events, settings: s } = await getSite();
  const e = events.find((x) => x.id === id);
  if (!e) return {};
  const text = e.description.replace(/\s+/g, ' ').trim();
  const description = text ? (text.length > 120 ? `${text.slice(0, 117).trimEnd()}...` : text) : s.description;
  return {
    title: e.name,
    description,
    // No openGraph here: the layout's openGraph then applies, with the site name and the share image.
    alternates: { canonical: `/events/${e.id}` },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const site = await getSite();
  const e = site.events.find((x) => x.id === id);
  if (!e) notFound();
  return (
    <div className="flex flex-1 justify-center bg-linear-to-b from-[#333333b3] to-[#515151b3] lg:py-[63px]">
      <EventDetail e={e} site={site} mode="page" serverNow={Date.now()} />
    </div>
  );
}
