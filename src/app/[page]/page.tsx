import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RichText } from '@/components/RichText';
import { getSite } from '@/lib/data';

export const revalidate = 60;
export const dynamicParams = false;

/** The document pages. Their text comes from the pages tab of the sheet. */
const PAGES: Record<string, { title: string; wide: boolean }> = {
  about: { title: 'About', wide: false },
  guide: { title: 'Guide', wide: false },
  policy: { title: 'Privacy policy', wide: true },
  terms: { title: 'Terms of service', wide: true },
};

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const meta = PAGES[page];
  if (!meta) return {};
  const { pages } = await getSite();
  const lead = pages[page]?.lead[0]?.replace(/\s+/g, ' ').slice(0, 160);
  return { title: meta.title, description: lead, alternates: { canonical: `/${page}` } };
}

const BODY = 'flex flex-col text-sm font-semibold leading-[21px] text-fg-subtle lg:text-lg lg:leading-[27px]';

export default async function DocPage({ params }: Props) {
  const { page } = await params;
  const meta = PAGES[page];
  if (!meta) notFound();
  const { pages, contacts } = await getSite();
  const doc = pages[page] ?? { lead: [], sections: [] };
  const groups = page === 'guide' ? [...new Set(contacts.map((c) => c.group))] : [];

  return (
    <div
      className={`mx-auto w-full px-5 lg:px-0 ${meta.wide ? 'max-w-detail pb-[100px] pt-5 lg:pb-[200px] lg:pt-[120px]' : 'max-w-doc py-5 lg:my-auto lg:py-12'}`}
    >
      <h1 className="text-xl font-bold leading-none lg:text-[40px]">{meta.title}</h1>
      {doc.lead.length > 0 && (
        <div className={`mt-6 ${BODY}`}>
          {doc.lead.map((p, i) => (
            <RichText key={i} text={p} />
          ))}
        </div>
      )}
      <div className="mt-[50px] flex flex-col gap-10 lg:mt-10">
        {doc.sections.map((sec) => (
          <section key={sec.heading}>
            <h2 className="text-base font-bold leading-none lg:text-2xl">{sec.heading}</h2>
            <div className={`mt-3 gap-3 ${BODY}`}>
              {sec.paragraphs.map((p, i) => (
                <RichText key={i} text={p} className="flex flex-col gap-1" />
              ))}
            </div>
          </section>
        ))}
        {groups.map((g) => (
          <section key={g}>
            <h2 className="text-base font-bold leading-none lg:text-2xl">{g}</h2>
            <ul className={`mt-3 gap-1 ${BODY}`}>
              {contacts
                .filter((c) => c.group === g)
                .map((c) => (
                  <li key={c.name + c.phone}>
                    {c.name}
                    {c.phone && (
                      <>
                        {': '}
                        <a href={`tel:${c.phone.replace(/[\s-]/g, '')}`} className="underline underline-offset-4">
                          {c.phone}
                        </a>
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
