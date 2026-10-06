import localFont from 'next/font/local';
import { fitLine, fitTitle } from '@/lib/core.mjs';
import type { EventItem } from '@/lib/data';

// Aoboshi One, Latin subset (SIL Open Font License 1.1, see src/app/fonts/AoboshiOne-OFL.txt).
const aoboshi = localFont({ src: '../app/fonts/AoboshiOne-Latin.woff2', display: 'swap' });

// The body breaks words anywhere (overflow-wrap: anywhere). The banner lines must never break.
const line = 'whitespace-nowrap uppercase wrap-normal';

/** An event's name and subtitle in Aoboshi One, centred. Visual only: the caller gives the accessible name.
 * Sizes are in cqw, so the nearest ancestor with container-type: inline-size sets the scale. */
export function BannerText({ e }: { e: EventItem }) {
  const { lines, size } = fitTitle(e.name);
  return (
    <span aria-hidden className={`flex flex-col items-center text-center ${aoboshi.className}`}>
      {lines.map((l) => (
        <span key={l} className={`${line} leading-[1.05]`} style={{ fontSize: `${size}cqw` }}>
          {l}
        </span>
      ))}
      {e.subtitle && (
        <span className={`${line} mt-[1.5cqw] leading-tight`} style={{ fontSize: `${fitLine(e.subtitle, 5)}cqw` }}>
          {e.subtitle}
        </span>
      )}
    </span>
  );
}
