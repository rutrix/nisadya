import { ChevronDown } from 'lucide-react';
import type { Faq as FaqItem } from '@/lib/data';
import { RichText } from '../RichText';

export function Faq({ faq }: { faq: FaqItem[] }) {
  if (faq.length === 0) return null;
  const groups = new Map<string, FaqItem[]>();
  for (const f of faq) groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto w-full max-w-wide scroll-mt-(--header-h) px-4 py-[100px] lg:pt-[200px]">
      <h2 id="faq-title" className="sr-only">
        Frequently asked questions
      </h2>
      <div className={`grid gap-[60px] lg:gap-10 ${groups.size > 1 ? 'lg:grid-cols-2' : ''}`}>
        {[...groups].map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[28px] font-bold leading-none lg:text-5xl lg:leading-[57.6px]">{category}</h3>
            <div className="mt-8 bg-surface-dark px-[15px] py-[5px] lg:px-10 lg:py-[15px]">
              {items.map((f) => (
                <details key={f.question} className="group border-line-on-dark not-first:border-t">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-bold leading-6 text-fg-on-dark lg:text-lg lg:leading-[27px] [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-fast ease-out group-open:rotate-180 lg:h-5 lg:w-5" aria-hidden />
                  </summary>
                  <RichText
                    text={f.answer}
                    className="mx-[-15px] bg-faq-answer px-[15px] py-6 text-sm leading-[21px] text-black lg:-mx-10 lg:px-10 lg:py-8 lg:text-lg lg:leading-[27px]"
                  />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
