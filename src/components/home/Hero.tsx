import Image, { getImageProps } from 'next/image';
import type { Settings } from '@/lib/data';
import { dateRange } from '@/lib/format';
import { Countdown } from './Countdown';
import { HeroAction } from './HeroAction';

// The hero image sets in public/hero. The script in layout.tsx picks one per visit and sets data-hero
// (1 to HERO_SETS.length) on <html>. globals.css shows only that set. Without the script, set 1 shows.
export const HERO_SETS = ['gears', 'orrery', 'ruins', 'chess', 'dice'];

/** A picture per theme, art-directed for phones and desktops. Lazy, so only the visible picture loads. */
function Poster({ desktop, mobile, className }: { desktop: string; mobile: string; className: string }) {
  const common = { alt: '', fill: true, sizes: '100vw', loading: 'lazy' as const };
  const d = getImageProps({ ...common, src: desktop }).props;
  const m = getImageProps({ ...common, src: mobile }).props;
  return (
    <picture className={className}>
      <source media="(max-width: 767.98px)" srcSet={m.srcSet ?? m.src} />
      <img {...d} alt="" className="object-cover" />
    </picture>
  );
}

function HeroSet({ name, n }: { name: string; n: number }) {
  const src = (size: string, theme: string) => `/hero/hero-${name}-${size}-${theme}.webp`;
  return (
    <div className="hero-set" data-set={n}>
      <Poster desktop={src('desktop', 'light')} mobile={src('mobile', 'light')} className="dark:hidden" />
      <Poster desktop={src('desktop', 'dark')} mobile={src('mobile', 'dark')} className="hidden dark:block" />
    </div>
  );
}

export function Hero({ s, name, serverNow, phase }: { s: Settings; name: string; serverNow: number; phase: Record<string, string> }) {
  const venue = s.venue_name;

  return (
    // overflow-x-clip: the .halo patches reach a little past the text and must not widen a phone page.
    <div className="relative isolate overflow-x-clip">
      {/* The key visual behind the hero and the countdown. */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 aspect-[390/1004] overflow-hidden md:aspect-[768/1560] lg:aspect-[1920/2310]">
        {HERO_SETS.map((name, i) => (
          <HeroSet key={name} name={name} n={i + 1} />
        ))}
      </div>
      <section aria-labelledby="hero-title" className="relative aspect-[390/1004] md:aspect-[768/944] lg:aspect-[1920/1400]">
        <div className="absolute inset-x-0 top-[26.9%] flex justify-center px-4 text-center md:top-[22%]">
          <div className="halo flex flex-col items-center gap-3 md:gap-4 lg:gap-8">
            <h1 id="hero-title">
              <span className="sr-only">{name}</span>
              <span aria-hidden className="relative block aspect-[4/1] w-[260px] md:w-[332px] lg:w-[600px]">
                <Image src="/nisadya-logo.svg" alt="" fill priority className="object-contain invert dark:invert-0" />
              </span>
            </h1>
            {s.tagline && <p className="text-xl font-bold leading-[30px] md:text-2xl md:leading-9 lg:text-[40px] lg:leading-[52px]">{s.tagline}</p>}
            <p className="text-xs font-bold leading-[16.8px] md:text-base md:leading-[22.4px] lg:text-2xl lg:leading-9">
              {dateRange(s.event_start, s.event_end)}
              {venue && (
                <>
                  <br className="lg:hidden" />
                  <span className="hidden lg:inline">, </span>
                  {venue}
                </>
              )}
            </p>
            <HeroAction s={phase} serverNow={serverNow} url={s.registration_url} />
          </div>
        </div>
      </section>
      <Countdown s={phase} serverNow={serverNow} name={name} />
    </div>
  );
}
