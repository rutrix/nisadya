import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventsView, EventsViewLive } from '@/components/events/EventsView';
import { getSite } from '@/lib/data';

export const revalidate = 60;
// The description is the lead row (empty heading) of page "events" in the pages tab. Without it, the layout's applies.
export async function generateMetadata(): Promise<Metadata> {
  const { pages } = await getSite();
  const description = pages.events?.lead[0]?.replace(/\s+/g, ' ').slice(0, 160);
  // An undefined description would remove the layout's one, so the key is set only with a value.
  return { title: 'Events', ...(description && { description }), alternates: { canonical: '/events' } };
}

export default async function EventsPage() {
  const { events, schedule } = await getSite();
  // The fallback is the default view, so the static HTML already lists every event.
  return (
    <Suspense fallback={<EventsView events={events} schedule={schedule} query="" />}>
      <EventsViewLive events={events} schedule={schedule} />
    </Suspense>
  );
}
