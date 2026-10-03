import { fetchSiteConfig, fetchSheetData, GIDS, SiteConfig } from './gsheet';
import {
  FALLBACK_CONFIG,
  FALLBACK_EVENTS,
  FALLBACK_SCHEDULE,
} from './fallback-content';

interface ServerData {
  config: SiteConfig;
  events: any[];
  schedule: any[];
}

// Offline fallback config: the 2026-07-08 live-sheet snapshot, used whenever
// Sheets is unreachable or returns no config rows. registration_link is the one
// key the snapshot lacks that anything reads (Hero.tsx), so it is defaulted
// here; every other former default was shadowed by the snapshot or never read.
const FALLBACK_CONFIG_MERGED: SiteConfig = { registration_link: '#events', ...FALLBACK_CONFIG };

/**
 * Fetch all required data from Google Sheets on the server
 * Returns data with fallbacks if sheets are empty or error occurs
 */
export async function getServerData(): Promise<ServerData> {
  try {
    // Fetch config
    const config = await fetchSiteConfig();

    // Fetch events
    const events = await fetchSheetData(GIDS.EVENTS, (headers, row) => {
      const event = {
        name: row[headers.indexOf('event name')] || '',
        description: row[headers.indexOf('description')] || '',
        startDate: row[headers.indexOf('start date')] || '',
        endDate: row[headers.indexOf('end date')] || '',
        unstopLink: row[headers.indexOf('unstop link')] || '',
        imageLink: row[headers.indexOf('image link')] || '',
        coordinator: row[headers.indexOf('coordinator')] || '',
        contact: row[headers.indexOf('contact')] || '',
        category: row[headers.indexOf('category')] || '',
      };
      if (!event.name) return null;
      return event;
    });

    // Fetch schedule
    const schedule = await fetchSheetData(GIDS.SCHEDULE, (headers, row) => {
      const item = {
        day: row[headers.indexOf('day')] || '',
        date: row[headers.indexOf('date')] || '',
        time: row[headers.indexOf('time')] || '',
        title: row[headers.indexOf('event name')] || '',
        venue: row[headers.indexOf('venue')] || '',
        category: row[headers.indexOf('category')] || '',
      };
      if (!item.day || !item.title) return null;
      return item;
    });

    // Return real sheet data verbatim. An emptied tab STAYS empty: clearing a
    // tab is how a teaser is built, and substituting the 2026-07-08 snapshot
    // there republished last year's events. The snapshot is now only for the
    // outage path in the catch below, which fetchSheetData reaches by throwing.
    // config keeps its fallback: a CONFIG tab with zero rows is a mistake, not
    // a teaser (a teaser still needs hero_year and hero_description set), and
    // an empty config would strip the hero and every contact.
    return {
      config: Object.keys(config).length > 0 ? config : FALLBACK_CONFIG_MERGED,
      events,
      schedule,
    };
  } catch (error) {
    console.error('Error fetching server data:', error);
    // Sheets unreachable: serve the 2026-07-08 offline snapshot instead of blanks.
    return {
      config: FALLBACK_CONFIG_MERGED,
      events: FALLBACK_EVENTS,
      schedule: FALLBACK_SCHEDULE,
    };
  }
}
