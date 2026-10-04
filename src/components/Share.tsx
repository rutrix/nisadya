'use client';
import { Link2 } from 'lucide-react';
import { BrandIcon, type Brand } from './BrandIcon';
import { toast } from './Toast';

const STYLES = {
  home: {
    list: 'flex max-w-[164px] flex-wrap justify-center gap-2.5 md:max-w-none',
    button: 'grid h-12 w-12 place-items-center bg-share text-white backdrop-blur-[8px] transition-colors duration-fast ease-out md:h-20 md:w-20 md:backdrop-blur-[12px] [@media(hover:hover)]:hover:bg-share-hover',
    icon: 'h-[25px] w-[25px] md:h-[42px] md:w-[42px]',
  },
  detail: {
    list: 'flex flex-wrap gap-2',
    button: 'grid h-12 w-12 place-items-center rounded-full border border-line-subtle bg-bg text-fg-secondary transition-colors duration-fast [@media(hover:hover)]:hover:bg-surface-faint',
    icon: 'h-5 w-5',
  },
};

/** WhatsApp, Facebook, X and LinkedIn as plain links (no SDK), plus copy link. */
export function Share({ url, title, variant }: { url: string; title: string; variant: keyof typeof STYLES }) {
  const st = STYLES[variant];
  const q = encodeURIComponent;
  const links: [Brand, string, string][] = [
    ['whatsapp', 'WhatsApp', `https://wa.me/?text=${q(`${title} ${url}`)}`],
    ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${q(url)}`],
    ['x', 'X', `https://x.com/intent/post?url=${q(url)}&text=${q(title)}`],
    ['linkedin', 'LinkedIn', `https://www.linkedin.com/feed/?shareActive=true&text=${q(`${title} ${url}`)}`],
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied', { ms: 3000, icon: true });
    } catch {
      toast('The link could not be copied', { ms: 8000, error: true });
    }
  };
  return (
    <ul className={st.list}>
      {links.map(([name, label, href]) => (
        <li key={name}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={st.button}>
            <BrandIcon name={name} className={st.icon} />
            <span className="sr-only">Share on {label} (opens in a new window)</span>
          </a>
        </li>
      ))}
      <li>
        <button type="button" onClick={copy} className={st.button}>
          <Link2 className={st.icon} aria-hidden />
          <span className="sr-only">Copy the link</span>
        </button>
      </li>
    </ul>
  );
}
