'use client';
import { useEffect, useState } from 'react';
import { phaseAt } from '@/lib/core.mjs';
import { toast } from './Toast';

export type PhaseSettings = Record<string, string>;
export type PhaseInfo = ReturnType<typeof phaseAt> & { now: number; mounted: boolean };

const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
export const formatDay = (ms: number) => day.format(ms);

/**
 * The client computes the phase again every second, so a page that stays open changes its
 * button when a deadline passes. Until mount it uses the server time, so the first
 * client render matches the server HTML.
 */
export function usePhase(s: PhaseSettings, serverNow: number): PhaseInfo {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      t = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  const at = now ?? serverNow;
  return { ...phaseAt(at, s), now: at, mounted: now !== null };
}

/** Days, hours, minutes and seconds until a moment. */
export function parts(ms: number) {
  const left = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(left / 86400), h: Math.floor(left / 3600) % 24, m: Math.floor(left / 60) % 60, s: left % 60 };
}
export const two = (n: number) => String(n).padStart(2, '0');

/** A sentence for screen readers, e.g. "12 days, 3 hours and 4 minutes left". */
export function leftSentence(ms: number) {
  const { d, h, m } = parts(ms);
  return `${d} days, ${h} hours and ${m} minutes left`;
}

export function pillPrefix(p: PhaseInfo) {
  if (p.phase === 'open' && p.closes) return 'Closes in';
  if (p.phase === 'live') return 'Happening now';
  return 'Starts in';
}

/** The register action for the header, the menu and the hero. It returns null after the event. */
export function RegisterAction({ p, url, className }: { p: PhaseInfo; url: string; className: string }) {
  if (p.phase === 'ended') return null;
  if (p.phase === 'open' && /^https:\/\//i.test(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`btn-primary ${className}`}>
        Register<span className="sr-only"> on Unstop (opens in a new window)</span>
      </a>
    );
  }
  if (p.phase === 'soon' || p.phase === 'open') {
    const msg = p.opensAt ? `Registration opens on ${formatDay(p.opensAt)}` : 'Registration opens soon';
    return (
      <button type="button" className={`btn-primary ${className}`} onClick={() => toast(msg)}>
        Register
      </button>
    );
  }
  return (
    <span className={`btn-label ${className}`}>
      Closed<span className="sr-only">: registration is over</span>
    </span>
  );
}

/** The 250 x 50 countdown pill of the header and the mobile menu. */
export function CountdownPill({ p, className = '' }: { p: PhaseInfo; className?: string }) {
  if (p.phase === 'ended') return null;
  const live = p.phase === 'live';
  const { d, h, m, s } = parts((p.target ?? p.now) - p.now);
  return (
    <div
      className={`flex h-[50px] items-center justify-center gap-2 bg-white/20 shadow-inset-soft backdrop-blur-sm ${className}`}
    >
      <span className="font-semibold">{pillPrefix(p)}</span>
      {!live && p.target !== null && (
        <>
          <span className="tabular text-lg font-semibold" aria-hidden suppressHydrationWarning>
            {p.mounted ? `D-${d} ${two(h)}:${two(m)}:${two(s)}` : 'D-- --:--:--'}
          </span>
          {p.mounted && <span className="sr-only">{leftSentence(p.target - p.now)}</span>}
        </>
      )}
    </div>
  );
}
