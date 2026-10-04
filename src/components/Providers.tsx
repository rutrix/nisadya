'use client';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      {children}
      <RouteFocus />
    </ThemeProvider>
  );
}

/** After a route change, move the focus to main, unless a hash or an open dialog takes it. */
function RouteFocus() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    requestAnimationFrame(() => {
      const main = document.getElementById('main');
      const active = document.activeElement;
      // A dialog keeps the focus, and so does a card that got the focus again when its dialog closed.
      if (document.querySelector('dialog[open]') || (active && active !== main && main?.contains(active))) return;
      main?.focus({ preventScroll: true });
    });
  }, [path]);
  return null;
}
