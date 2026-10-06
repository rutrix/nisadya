import type { MetadataRoute } from 'next';
import { SITE_URL, getSite } from '@/lib/data';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await getSite();
  // No lastModified: the site cannot tell when a sheet row changed, and a date that is always "now" misleads crawlers.
  return ['', '/events', ...events.map((e) => `/events/${e.id}`), '/about', '/guide', '/policy', '/terms'].map((p) => ({
    url: `${SITE_URL}${p}`,
  }));
}
