'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CountdownPill, RegisterAction, usePhase, type PhaseInfo, type PhaseSettings } from './Phase';
import { ThemeToggle } from './ThemeToggle';

export const NAV = [
  { href: '/events', label: 'Events' },
  { href: '/guide', label: 'Guide' },
  { href: '/#faq', label: 'FAQ' },
];

export type FrameProps = { name: string; regUrl: string; phase: PhaseSettings; serverNow: number };

/** The fest logo (an SVG) and the NITT emblem (a WebP), both in public/. The fest logo links home. */
export function Logo({ name }: { name: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Link href="/" className="shrink-0">
        <Image src="/nisadya-logo.svg" alt={name} width={3955} height={975} priority className="h-5 w-auto invert dark:invert-0 lg:h-6" />
      </Link>
      <Image src="/nitt-logo.webp" alt="NIT Tiruchirappalli" width={40} height={40} priority className="h-9 w-9 lg:h-10 lg:w-10" />
    </div>
  );
}

/** True when the scroll position is past the home header threshold (82px). */
export function useScrolledPast(px = 82) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => setPast(window.scrollY > px);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [px]);
  return past;
}

export function Header(props: FrameProps) {
  const home = usePathname() === '/';
  const p = usePhase(props.phase, props.serverNow);
  const scrolled = useScrolledPast();
  const menu = useRef<HTMLDialogElement>(null);
  const shown = !home || scrolled;

  return (
    <>
      <header
        // Keyboard focus inside the hidden header shows it. A mouse click on a link does not keep it shown.
        className={`${home ? 'fixed inset-x-0' : 'sticky'} top-0 z-40 border-b border-line-subtle bg-bg transition-transform duration-base has-[:focus-visible]:translate-y-0 ${shown ? '' : '-translate-y-full'}`}
      >
        <div className="mx-auto flex max-w-wide items-center justify-between px-4 py-4 lg:px-10">
          <div className="flex items-center gap-10">
            <Logo name={props.name} />
            <nav aria-label="Main" className="hidden gap-8 text-lg font-bold lg:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <CountdownPill p={p} className="w-[250px]" />
              <RegisterAction p={p} url={props.regUrl} className="h-[50px] px-5" />
            </div>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center lg:hidden"
              aria-label="Open the menu"
              aria-haspopup="dialog"
              onClick={() => menu.current?.showModal()}
            >
              <Menu size={24} aria-hidden />
            </button>
            {/* The slot of the theme button. The fixed layer below draws the button. */}
            <span className="h-10 w-10 shrink-0 lg:h-[50px] lg:w-[50px]" aria-hidden />
          </div>
        </div>
      </header>
      {/* The theme button stays fixed on its header slot. On the home page, it floats over the hero,
          and the header slides into view under it. The layer copies the header box, so the two align. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[calc(var(--header-h)-1px)] max-w-wide items-center justify-end px-4 lg:px-10">
          <ThemeToggle className="pointer-events-auto h-10 w-10 lg:h-[50px] lg:w-[50px]" />
        </div>
      </div>
      <MobileMenu ref={menu} p={p} {...props} />
    </>
  );
}

function MobileMenu({ ref, p, ...props }: FrameProps & { ref: React.RefObject<HTMLDialogElement | null>; p: PhaseInfo }) {
  const close = () => ref.current?.close();
  return (
    <dialog
      ref={ref}
      aria-label="Menu"
      className="fixed inset-0 m-0 h-full w-full bg-[var(--overlay-sheet)] p-0 backdrop:backdrop-blur-[12px] lg:hidden"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="bg-bg">
        <div className="flex h-[77px] items-center justify-between px-4" onClick={(e) => (e.target as HTMLElement).closest('a') && close()}>
          <Logo name={props.name} />
          <button type="button" className="grid h-11 w-11 place-items-center" aria-label="Close the menu" onClick={close}>
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-10 px-4 pb-10 pt-6" onClick={(e) => (e.target as HTMLElement).closest('a') && close()}>
          <CountdownPill p={p} className="w-full" />
          <nav aria-label="Menu" className="flex flex-col items-center gap-6 text-2xl font-bold">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <RegisterAction p={p} url={props.regUrl} className="h-[70px] w-full text-xl" />
        </div>
      </div>
    </dialog>
  );
}
