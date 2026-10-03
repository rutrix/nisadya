const SPREADSHEET_ID = '2PACX-1vT7vRAeLIaAsM9SJYgjA8F0wb40RsDp712u8QRhRqB9oUVdfxh8kpkoAZ1RNsFQgwaBex_HcnkoUBEn';
const BASE_URL = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub`;

export const GIDS = {
    EVENTS: '0',
    SCHEDULE: '104413209',
    CONFIG: '545694281',
};

const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentRow.push(currentCell.trim());
            if (currentRow.some(cell => cell !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell) currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell !== '')) {
        rows.push(currentRow);
    }
    return rows;
};

export async function fetchSheetData<T>(gid: string, rowMapper: (headers: string[], row: string[]) => T | null): Promise<T[]> {
    try {
        const url = `${BASE_URL}?output=csv&gid=${gid}`;

        // Default fetch behavior in Next.js App Router (if not specified) is 'force-cache' for static generation
        // Adding revalidate to ensure sheet updates are picked up periodically (ISR)
        // Setting to 60 caches each sheet fetch for 60 seconds: sheet edits show up within a minute
        // while repeat visitors in that window are served from cache instead of re-hitting Google
        const response = await fetch(url, { next: { revalidate: 60 } });

        if (!response.ok) {
            throw new Error(`Failed to fetch sheet with GID ${gid}: ${response.statusText}`);
        }
        const text = await response.text();
        const parsedData = parseCSV(text);

        if (parsedData.length < 2) return [];

        const headers = parsedData[0].map(h => h.toLowerCase().trim());
        const dataRows = parsedData.slice(1);

        return dataRows
            .map(row => rowMapper(headers, row))
            .filter((item): item is T => item !== null);

    } catch (error) {
        // Rethrow, do not swallow. server-data.ts has to tell an outage apart
        // from a deliberately emptied tab: an outage lands in its catch and
        // gets the offline snapshot, an empty tab returns [] and stays empty.
        // server-data.ts, the only caller, catches.
        console.error(`Error fetching or parsing sheet with GID ${gid}:`, error);
        throw error;
    }
}

export interface SiteConfig {
    hero_title?: string;
    hero_subtitle?: string;
    hero_date?: string;
    hero_description?: string;
    registration_link?: string;
    about_title?: string;
    about_subtitle?: string;
    about_description?: string;
    about_tagline?: string;
    doms_title?: string;
    doms_subtitle?: string;
    doms_description?: string;
    doms_tagline?: string;
    doms_description_alignment?: string; // center | left | right | justify
    about_description_alignment?: string; // center | left | right | justify
    contact_linkedin?: string;
    contact_instagram?: string;
    contact_twitter?: string;
    contact_youtube?: string;
    contact_location?: string;
    registration_status?: string; // 'PRE_REGISTRATION' | 'OPEN' | 'CLOSED'
    registration_start_date?: string; // YYYY-MM-DD
    registration_end_date?: string; // YYYY-MM-DD
    members_contacts?: string; // JSON string of contacts
    taxi_contacts?: string; // JSON string of taxi contacts
    unstop_url?: string;
    stay_arrival?: string; // e.g. "12 November evening"; blank hides the sentence
    stay_price_men?: string; // e.g. "₹1,000"; blank hides the tier
    stay_price_women?: string;
    stay_form_url?: string; // blank hides the Book Accommodation button
    [key: string]: string | undefined;
}

export async function fetchSiteConfig(): Promise<SiteConfig> {
    const rows = await fetchSheetData<[string, string]>(GIDS.CONFIG, (headers, row) => {
        // Use index 0 for key and index 1 for value to be robust against header naming changes
        const key = row[0];
        if (!key) return null;
        return [key.trim(), row[1] || ''];
    });

    return Object.fromEntries(rows) as SiteConfig;
}

export const getDriveImage = (link: string | undefined): string => {
    if (!link) return '';
    const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : link;
};
