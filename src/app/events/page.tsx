import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventsView, EventsViewLive } from '@/components/events/EventsView';
import { getSite } from '@/lib/data';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Events', alternates: { canonical: '/events' } };

export default async function EventsPage() {
  const { events, schedule } = await getSite();
  // The fallback is the default view, so the static HTML already lists every event.
  return (
    <Suspense fallback={<EventsView events={events} schedule={schedule} query="" />}>
      <EventsViewLive events={events} schedule={schedule} />
    </Suspense>
  );
}
