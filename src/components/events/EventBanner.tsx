import type { EventItem } from '@/lib/data';
import { BannerText } from '../BannerText';
import { accentOf } from '../EventCard';

/** The text banner of an event: its name and subtitle on the event's card colour, scaled as one picture. */
export function EventBanner({ e }: { e: EventItem }) {
  const label = e.subtitle ? `${e.name}, ${e.subtitle}` : e.name;
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex aspect-[9/5] flex-col items-center justify-center overflow-hidden text-black [container-type:inline-size] ${accentOf(e).base}`}
    >
      <BannerText e={e} />
    </div>
  );
}
