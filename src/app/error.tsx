'use client';
import Link from 'next/link';

/** A page that failed to render. The header and footer stay. Retry reads the page again. */
export default function PageError({ retry }: { retry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="text-2xl font-bold leading-9 lg:text-[32px] lg:leading-[48px]">This page could not load</h1>
      <p className="mt-2 text-sm font-semibold leading-[21px] lg:text-lg lg:leading-[27px]">Try again, or start again from the home page.</p>
      <div className="mt-8 flex flex-col gap-3 lg:mt-10">
        <button type="button" onClick={() => retry()} className="btn-primary h-14 w-[240px] text-base lg:h-[70px] lg:w-[402px] lg:text-xl">
          Try again
        </button>
        <Link href="/" className="inline-flex h-11 items-center justify-center font-semibold underline underline-offset-4">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
