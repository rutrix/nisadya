
import { SiteConfig } from '@/lib/gsheet';

// NEXT-EDITION TOUCHPOINT: nothing here now. The Event name and start date come
// from the CONFIG tab (hero_year, hero_date), so a 2028 refresh is a sheet edit.
// Only the venue, the logo and the organiser below are hard-coded.
//
// The Event object is emitted ONLY when hero_date is a strict YYYY-MM-DD value.
// A wrong date is worse than no date: Google indexes it and shows it in search
// for months. Loose parsing is deliberately not used, because new Date('2027')
// and new Date('February 2027') both succeed and would invent a precise day.
// With no usable date the page still declares who runs the fest, via Organization.
const ORGANIZER = {
  '@type': 'Organization',
  name: 'DoMS NIT Trichy',
  url: 'https://nisadya.in',
};

export default function JsonLd({ config }: { config?: SiteConfig }) {
  const heroDate = config?.hero_date;
  const startDate =
    heroDate && /^\d{4}-\d{2}-\d{2}$/.test(heroDate) && !isNaN(new Date(heroDate).getTime())
      ? heroDate
      : null;
  const year = config?.hero_year || '2026';
  const name = `Nisadya'${year.slice(-2)}`;

  const jsonLd = startDate
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name,
        startDate,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: 'NIT Tiruchirappalli',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Tanjore Main Road, NH67',
            addressLocality: 'Tiruchirappalli',
            postalCode: '620015',
            addressRegion: 'Tamil Nadu',
            addressCountry: 'IN',
          },
        },
        image: ['https://nisadya.in/fest_main_logo.png'],
        description: `${name} is the annual college fest of DOMS NIT Trichy, celebrating talent, creativity, and innovation.`,
        organizer: ORGANIZER,
      }
    : {
        '@context': 'https://schema.org',
        ...ORGANIZER,
        logo: 'https://nisadya.in/fest_main_logo.png',
        description: `${name} is the annual college fest of DOMS NIT Trichy, celebrating talent, creativity, and innovation.`,
      };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
