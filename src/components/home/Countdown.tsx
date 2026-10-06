'use client';
import { dateRange } from '@/lib/format';
import { leftSentence, parts, two, usePhase, type PhaseSettings } from '../Phase';

const when = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata',
});
const lastDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });

const Bar = () => (
  <span className="inline-flex h-10 w-4 items-center md:h-20 md:w-8">
    <span className="h-2 w-4 bg-current md:h-[14px] md:w-8" />
  </span>
);
const Colon = () => (
  <span className="inline-flex h-10 flex-col justify-center gap-[9px] px-1 md:h-20 md:gap-5 md:px-2">
    <span className="h-2 w-2 bg-current md:h-[14px] md:w-[14px]" />
    <span className="h-2 w-2 bg-current md:h-[14px] md:w-[14px]" />
  </span>
);

/** Home countdown (H2). It shows nothing after the event. */
export function Countdown({ s, serverNow, name }: { s: PhaseSettings; serverNow: number; name: string }) {
  const p = usePhase(s, serverNow);
  if (p.phase === 'ended') return null;
  const live = p.phase === 'live';
  const closes = p.phase === 'open' && p.closes;
  const heading = live ? `${name} is on` : closes ? 'Registration closes in' : `${name} begins in`;
  const sub = live
    ? dateRange(s.event_start, s.event_end)
    : closes && p.target
      ? `Last day to register: ${lastDay.format(p.target - 1)}`
      : p.target
        ? `${when.format(p.target)} IST`
        : '';
  const t = parts(p.target !== null ? p.target - p.now : 0);
  const digits = (v: string) => (p.mounted ? v : v.replace(/\d/g, '0'));

  return (
    <section
      aria-labelledby="countdown-title"
      // On phones the block follows the hero image. From 768 px it sits inside the image box of Hero.tsx.
      className="flex flex-col items-center px-4 pb-[25.6vw] pt-[12.8vw] text-center md:absolute md:inset-x-0 md:top-[80%] md:-translate-y-1/2 md:py-0"
    >
      <div className="halo flex flex-col items-center gap-6 lg:gap-8">
        <h2 id="countdown-title" className="text-2xl font-bold leading-9 md:text-[40px] md:leading-[52px]">
          {heading}
        </h2>
        {sub && (
          // The server and the browser may format a date slightly differently (different ICU versions).
          <p suppressHydrationWarning className="text-[13px] font-semibold leading-[18.2px] text-fg md:text-base md:leading-6">
            {sub}
          </p>
        )}
        {!live && p.target !== null && (
          <>
            <div
              aria-hidden
              // nowrap: the body's overflow-wrap:anywhere lets Firefox split "41" over two lines.
              className={`tabular flex flex-col items-center gap-2 whitespace-nowrap font-display text-[45px] font-black leading-none tracking-[-0.02em] md:text-[90px] lg:flex-row lg:gap-10 ${p.mounted ? '' : 'invisible'}`}
            >
              <span className="flex shrink-0 items-center gap-2 md:gap-4">
                <span>D</span>
                <Bar />
                <span>{digits(String(t.d))}</span>
              </span>
              <span className="hidden h-[74px] w-0.5 shrink-0 bg-line-subtle lg:block" />
              <span className="flex shrink-0 items-center">
                <span>{digits(two(t.h))}</span>
                <Colon />
                <span>{digits(two(t.m))}</span>
                <Colon />
                <span>{digits(two(t.s))}</span>
              </span>
            </div>
            {p.mounted && <p className="sr-only">{leftSentence(p.target - p.now)}</p>}
          </>
        )}
      </div>
    </section>
  );
}
