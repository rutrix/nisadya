import Link from 'next/link';
import { isEmail } from '@/lib/core.mjs';
import type { Settings } from '@/lib/data';

const INTERNAL = [
  { href: '/about', label: 'About' },
  { href: '/guide', label: 'Guide' },
  { href: '/policy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms' },
];
const item = 'md:[&:not(:first-child)]:border-l-2 md:[&:not(:first-child)]:border-line-subtle md:[&:not(:first-child)]:pl-3';
const link = 'underline-offset-4 [@media(hover:hover)]:hover:underline';

export function Footer({ s }: { s: Settings }) {
  const external = (
    [
      ['Instagram', s.instagram],
      ['LinkedIn', s.linkedin],
      ['X', s.x],
      ['YouTube', s.youtube],
      ['Unstop', s.registration_url],
    ] as const
  ).filter(([, url]) => /^https:\/\//i.test(url ?? ''));
  const address = (s.venue_address ?? '').split('\n').map((l) => l.trim().replace(/,$/, '')).filter(Boolean).join(', ');
  const legal = [
    ['Organiser', s.organiser],
    ['Address', address],
    ['Email', s.email],
  ].filter(([, v]) => v);

  return (
    <footer className="border-t border-line-subtle px-5 pb-[60px] pt-10 md:p-10">
      <nav aria-label="Footer" className="grid grid-cols-2 gap-4 font-semibold md:flex md:flex-wrap md:gap-x-3 md:gap-y-2">
        <ul className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-3 md:gap-y-2">
          {INTERNAL.map((l) => (
            <li key={l.href} className={item}>
              <Link href={l.href} className={link}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-x-3 md:gap-y-2 md:border-l-2 md:border-line-subtle md:pl-3">
          {external.map(([label, url]) => (
            <li key={label} className={item}>
              <a href={url} target="_blank" rel="noopener noreferrer" className={link}>
                {label}
                <span className="sr-only"> (opens in a new window)</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-10 text-[13px] font-semibold leading-[18.2px] text-fg-legal md:mt-4 md:text-sm md:leading-[21px]">
        <h2 className="sr-only">Organiser details</h2>
        <dl className="flex flex-col lg:flex-row lg:flex-wrap lg:gap-x-4">
          {legal.map(([k, v]) => (
            <div key={k}>
              <dt className="inline">{k}: </dt>
              <dd className="inline">{k === 'Email' && isEmail(v) ? <a href={`mailto:${v}`} className={link}>{v}</a> : v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1">
          © {s.edition} {s.event_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
