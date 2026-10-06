import { Bus, MapPin, Plane, TrainFront, TramFront, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import MAP from '@/data/venue-map.json';
import { directionsUrl, parsePlaces, placeOnMap } from '@/lib/core.mjs';
import type { Settings } from '@/lib/data';

const MODES: [RegExp, LucideIcon][] = [
  [/^(airport|air|flight)/i, Plane],
  [/^(railway|rail|train)/i, TrainFront],
  [/^metro/i, TramFront],
  [/^bus/i, Bus],
];
const iconFor = (line: string) => MODES.find(([re]) => re.test(line))?.[1] ?? MapPin;

// Where the label sits around the 12px dot. The dot centre lands on the place.
// The venue always gets a pin with the label above it, so the highlighted building stays visible.
const PIN = 'bottom-0 left-0 -translate-x-1/2 translate-y-0.5 flex-col-reverse';
const SIDE: Record<string, string> = {
  right: 'left-0 top-0 -translate-x-1.5 -translate-y-1/2',
  left: 'right-0 top-0 translate-x-1.5 -translate-y-1/2 flex-row-reverse',
  above: 'bottom-0 left-0 -translate-x-1/2 translate-y-1.5 flex-col-reverse',
  below: 'left-0 top-0 -translate-x-1/2 -translate-y-1.5 flex-col',
};

export function Venue({ s }: { s: Settings }) {
  const transit = (s.transit ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const mapUrl = /^https:\/\//i.test(s.venue_map_url ?? '') ? s.venue_map_url : '';
  // The first place is the venue. Each file has its own bounds, so a place can sit on one map only.
  const places = parsePlaces(s.venue_places).flatMap((p, i) => {
    const [m, d] = [placeOnMap(MAP.mobile, p.lat, p.lon), placeOnMap(MAP.desktop, p.lat, p.lon)];
    return m || d ? [{ ...p, venue: i === 0, m, d }] : [];
  });
  if (!s.venue_name) return null;
  return (
    <section aria-labelledby="venue-title" className="bg-venue-bg text-fg">
      <div className="mx-auto max-w-page px-4 py-[100px] lg:py-[200px]">
        <h2 id="venue-title" className="text-center text-[28px] font-bold leading-none lg:text-5xl lg:leading-[57.6px]">
          Venue
        </h2>
        <div className="mt-12 flex flex-col lg:h-[458px] lg:flex-row">
          <div className="flex shrink-0 flex-col gap-6 bg-venue-panel p-6 text-black lg:w-[328px] lg:p-10">
            <h3 className="text-lg font-bold leading-[27px] lg:text-2xl lg:leading-9">{s.venue_name}</h3>
            {transit.length > 0 && (
              <ul className="mt-auto flex flex-col gap-2">
                {transit.map((line) => {
                  const Icon = iconFor(line);
                  return (
                    <li key={line} className="flex items-center gap-2 text-base font-bold lg:text-lg lg:leading-[27px]">
                      <Icon className="h-5 w-5 shrink-0 lg:h-6 lg:w-6" aria-hidden />
                      {line}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {/* The box keeps each file's aspect ratio, so a place is a plain percentage of it. From 1080px
              the box is 920px wide and the wrapper clips its left side when the row is narrower. */}
          <div className="relative order-first overflow-hidden bg-surface-faint lg:order-last lg:min-w-0 lg:flex-1">
            <div className="relative aspect-688/516 w-full lg:absolute lg:right-0 lg:top-0 lg:aspect-992/494 lg:h-full lg:w-auto">
              <picture>
                <source media="(min-width: 1080px)" srcSet={MAP.desktop.src} />
                <img src={MAP.mobile.src} alt={s.venue_map_alt || `Map of ${s.venue_name}`} loading="lazy" className="absolute inset-0 h-full w-full" />
              </picture>
              {places.length > 0 && (
                <ul aria-label="Places on the map">
                  {places.map((p) => (
                    <li
                      key={`${p.lat},${p.lon}`}
                      style={{ '--mx': `${p.m?.x}%`, '--my': `${p.m?.y}%`, '--dx': `${p.d?.x}%`, '--dy': `${p.d?.y}%` } as CSSProperties}
                      className={`absolute left-(--mx) top-(--my) lg:left-(--dx) lg:top-(--dy) ${p.m ? '' : 'hidden lg:block'} ${p.d ? '' : 'lg:hidden'}`}
                    >
                      <a
                        href={directionsUrl(p.lat, p.lon)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group absolute flex items-center gap-1 ${p.venue ? PIN : SIDE[p.side]}`}
                      >
                        {p.venue ? (
                          <MapPin className="h-6 w-6 shrink-0 fill-black text-white" strokeWidth={2} aria-hidden />
                        ) : (
                          <span className="h-3 w-3 shrink-0 rounded-full border-2 border-white bg-black" aria-hidden />
                        )}
                        <span
                          className={`whitespace-nowrap px-2 py-1 text-sm font-bold leading-5 underline-offset-2 [@media(hover:hover)]:group-hover:underline ${
                            p.venue ? 'bg-venue-panel text-black outline-solid outline-2 -outline-offset-2 outline-black' : 'bg-black text-white'
                          }`}
                        >
                          <span className="sr-only">Directions to </span>
                          {p.name}
                          <span className="sr-only"> (opens in a new window)</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-0 right-0 bg-white/80 px-1 text-[10px] leading-4 text-black"
              >
                © OpenStreetMap contributors<span className="sr-only"> (opens in a new window)</span>
              </a>
            </div>
          </div>
        </div>
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mx-auto mt-[50px] flex h-[70px] w-full max-w-[320px] text-xl lg:mt-[90px]"
          >
            <MapPin size={20} aria-hidden />
            Directions<span className="sr-only"> (opens in a new window)</span>
          </a>
        )}
      </div>
    </section>
  );
}
