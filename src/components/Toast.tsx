'use client';
import { Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Msg = { id: number; text: string; ms: number; error?: boolean; icon?: boolean };

/** Show one message at the top of the screen. */
export function toast(text: string, opts: { ms?: number; error?: boolean; icon?: boolean } = {}) {
  window.dispatchEvent(new CustomEvent<Msg>('toast', { detail: { id: Date.now(), text, ms: opts.ms ?? 6000, ...opts } }));
}

export function Toaster() {
  const [msg, setMsg] = useState<Msg | null>(null);
  // A modal dialog makes the rest of the page inert and covers it, so the message goes inside the open dialog.
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      setHost(document.querySelector('dialog[open]'));
      setMsg((e as CustomEvent<Msg>).detail);
    };
    window.addEventListener('toast', on);
    return () => window.removeEventListener('toast', on);
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), msg.ms);
    return () => clearTimeout(t);
  }, [msg]);
  const region = (
    <div className="pointer-events-none fixed inset-x-4 top-20 z-50 flex justify-center" role={msg?.error ? 'alert' : 'status'}>
      {msg && (
        <p
          key={msg.id}
          className={`flex items-center gap-2 rounded-[6px] border border-line bg-bg px-6 py-5 text-lg font-semibold shadow-toast ${msg.error ? 'text-danger' : ''}`}
        >
          {msg.icon && (
            <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-brand text-brand-fg">
              <Link2 size={14} aria-hidden />
            </span>
          )}
          {msg.text}
        </p>
      )}
    </div>
  );
  return host ? createPortal(region, host) : region;
}
