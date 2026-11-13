'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { timeOn } from '@/lib/format';
import { RegisterAction, usePhase, type PhaseSettings } from '../Phase';

const CLOSE = 'absolute right-0 top-0 z-10 grid h-10 w-10 place-items-center bg-brand text-brand-fg lg:h-12 lg:w-12';
// In a dialog the button sticks to the top, so it stays in view when the visitor scrolls the dialog on a phone.
const CLOSE_MODAL = 'sticky top-0 z-10 ml-auto -mb-10 grid h-10 w-10 place-items-center bg-brand text-brand-fg lg:-mb-12 lg:h-12 lg:w-12';

/** Close: in a dialog, it returns to the previous page in the history. On a full page, it links to the list. */
export function DetailClose({ mode }: { mode: 'page' | 'modal' }) {
  const router = useRouter();
  return mode === 'modal' ? (
    <button type="button" className={CLOSE_MODAL} aria-label="Close" onClick={() => router.back()}>
      <X className="h-[18px] w-[18px] lg:h-[22px] lg:w-[22px]" aria-hidden />
    </button>
  ) : (
    <Link href="/events" className={CLOSE} aria-label="Back to all events">
      <X className="h-[18px] w-[18px] lg:h-[22px] lg:w-[22px]" aria-hidden />
    </Link>
  );
}

export function DetailRegister({ s, serverNow, url, until }: { s: PhaseSettings; serverNow: number; url: string; until: number | null }) {
  const p = usePhase(s, serverNow);
  const note = useId();
  const cls = 'h-14 w-full text-base sm:w-[320px] lg:h-[70px] lg:text-xl';
  // This event's own on-spot window: a Register link until it closes. Otherwise the general button, without the
  // on-spot link that points to the other events.
  if (p.phase !== 'ended' && until && p.now < until && /^https:\/\//i.test(url))
    return (
      <div className="flex flex-col gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer" aria-describedby={note} className={`btn-primary ${cls}`}>
          Register<span className="sr-only"> on Unstop (opens in a new window)</span>
        </a>
        <p id={note} suppressHydrationWarning className="text-sm font-semibold">
          On-spot registration closes at {timeOn(until)}.
        </p>
      </div>
    );
  return <RegisterAction p={{ ...p, onspotUntil: null }} url={url} className={cls} />;
}

/**
 * The event as a dialog over the page that opened it (a Next.js intercepted route).
 * Escape, the close button or a click on the scrim returns to the previous page. The focus returns to the opener.
 */
export function EventDialog({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => opener?.focus?.({ preventScroll: true });
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        router.back();
      }}
      onClick={(e) => (e.target === e.currentTarget || (e.target as HTMLElement).dataset.scrim) && router.back()}
      className="fixed inset-0 z-50 m-0 h-full w-full overflow-y-auto bg-transparent bg-linear-to-b from-[#333333b3] to-[#515151b3] p-0 backdrop:backdrop-blur-[25px]"
    >
      <div data-scrim="1" className="flex min-h-full items-start justify-center lg:items-center lg:py-[63px]">
        {children}
      </div>
    </dialog>
  );
}
