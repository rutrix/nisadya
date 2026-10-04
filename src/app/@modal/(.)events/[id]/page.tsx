import { EventDetail } from '@/components/events/EventDetail';
import { DetailClose, EventDialog } from '@/components/events/DetailParts';
import { getSite } from '@/lib/data';

export const revalidate = 60;

/** A card click opens the event over the current page. A direct visit gets app/events/[id]. */
export default async function EventModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getSite();
  const e = site.events.find((x) => x.id === id);
  return (
    <EventDialog label={e?.name ?? 'Event not found'}>
      {e ? (
        <EventDetail e={e} site={site} mode="modal" serverNow={Date.now()} />
      ) : (
        <div className="relative m-auto bg-bg p-10 pr-16">
          <DetailClose mode="modal" />
          <p className="text-xl font-bold">This event was not found.</p>
        </div>
      )}
    </EventDialog>
  );
}
