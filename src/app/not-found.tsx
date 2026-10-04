import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span aria-hidden className="flex flex-col items-center gap-2">
        <span className="h-[66px] w-4 bg-current" />
        <span className="h-4 w-4 bg-current" />
      </span>
      <h1 className="mt-6 text-2xl font-bold leading-9 lg:mt-10 lg:text-[32px] lg:leading-[48px]">Page not found</h1>
      <div className="mt-2 text-sm font-semibold leading-[21px] lg:text-lg lg:leading-[27px]">
        <p>This page does not exist or has moved.</p>
        <p>Check the address, or start again from the home page.</p>
      </div>
      <Link href="/" className="btn-primary mt-8 h-14 w-[240px] text-base lg:mt-10 lg:h-[70px] lg:w-[402px] lg:text-xl">
        Go to the home page
      </Link>
    </div>
  );
}
