'use client';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

// Filled moon and sun, drawn for Nisadya on a 24-unit grid. The moon is a disc (r 8) minus a disc (r 7).
const ICON = 'h-[22px] w-[22px] lg:h-7 lg:w-7';
const Moon = () => (
  <svg viewBox="0 0 24 24" className={ICON} aria-hidden>
    <path fill="currentColor" d="M9.84 4.67A8 8 0 1 0 19.33 14.16A7 7 0 0 1 9.84 4.67Z" />
  </svg>
);
const Sun = () => (
  <svg viewBox="0 0 24 24" className={ICON} aria-hidden>
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M5.28 18.72l1.42-1.42M17.3 6.7l1.42-1.42"
    />
  </svg>
);

const subscribe = () => () => {};

/** The round theme button. The caller sets the size and position. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // False on the server and during hydration, true after it: the theme is known only in the browser.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === 'dark';
  const toggle = () => {
    const root = document.documentElement;
    root.setAttribute('data-theme-switching', '');
    setTheme(dark ? 'light' : 'dark');
    setTimeout(() => root.removeAttribute('data-theme-switching'), 200);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      className={`grid shrink-0 place-items-center rounded-full bg-brand text-brand-fg ring-2 ring-brand-fg ${className}`}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}
