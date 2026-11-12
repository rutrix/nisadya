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
    // From 768 px the box has the shape of the hero image, and both blocks sit inside it: title centre at 28% and
    // countdown centre at 80% of the image height (the centres of the empty bands, averaged over the five image sets).
    // Phones: the title centre sits at the middle of the visible screen (50svh). The empty band of the phone images
    // runs from 37.5% to 50% of the image height (96.5vw to 128.7vw). --shift moves the image up only when the screen
    // middle is above the band (short screens, mostly iPhones), so the title stays in the band. The countdown follows
    // the image. This assumes that the hero is the first block of the page.
    <div className="relative isolate overflow-x-clip [--shift:min(0px,calc(50svh-96.5vw))] md:aspect-768/1560 lg:aspect-1920/2310">
      {/* The key visual behind the hero and the countdown. */}
      <div aria-hidden className="absolute inset-x-0 top-(--shift) -z-10 aspect-390/1004 overflow-hidden md:top-0 md:aspect-768/1560 lg:aspect-1920/2310">
        {HERO_SETS.map((name, i) => (
          <HeroSet key={name} name={name} n={i + 1} />
        ))}
      </div>
      {/* Phones: the height of the image (257.44vw) less the part above the screen. */}
      <section aria-labelledby="hero-title" className="relative h-[calc(257.44vw+var(--shift))] md:absolute md:inset-0 md:h-auto">
        <div className="absolute inset-x-0 top-[50svh] flex -translate-y-1/2 justify-center px-4 text-center md:top-[28%]">
          <div className="halo flex flex-col items-center gap-3 md:gap-4 lg:gap-8">
            <h1 id="hero-title">
              <span className="sr-only">{name}</span>
              <span aria-hidden className="relative block aspect-4/1 w-[260px] md:w-[332px] lg:w-[600px]">
                <Image src="/nisadya-logo.svg" alt="" fill loading="eager" fetchPriority="high" className="object-contain invert dark:invert-0" />
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
            {/* The sponsor's artwork as supplied, on white in both themes: its colours are not ours to change. Spacing is
                optical: equal visible space above and below the label's capitals, and around the logo on all sides (the
                tagline baseline is the bottom edge, not the tail of its "y"). The border keeps the card's shape in light mode. */}
            <div className="mt-2 flex w-[200px] flex-col items-center border-2 border-venue-panel bg-white pb-[21px] text-black md:w-[270px] md:pb-[30px] lg:mt-0 lg:w-[320px] lg:pb-[35px]">
              <p className="self-stretch bg-venue-panel pb-2 pt-[6.5px] text-center text-xs font-semibold leading-none md:py-[9px] md:text-sm lg:py-[11px] lg:text-base">
                Title sponsor
              </p>
              <Image src="/sbi-logo.svg" alt="State Bank of India" width={442} height={216} className="mt-[22px] h-auto w-[150px] md:mt-8 md:w-[200px] lg:mt-[37px] lg:w-[240px]" />
            </div>
          </div>
        </div>
      </section>
      <Countdown s={phase} serverNow={serverNow} name={name} />
    </div>
  );
}
