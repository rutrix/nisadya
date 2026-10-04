import type { MetadataRoute } from 'next';
import { SITE_URL, getSite } from '@/lib/data';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await getSite();
  const now = new Date();
  return ['', '/events', ...events.map((e) => `/events/${e.id}`), '/about', '/guide', '/policy', '/terms'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
  }));
}
