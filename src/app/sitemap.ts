import { MetadataRoute } from 'next';

// The home page is the only route. Add more entries here if that changes.
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://nisadya.in',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];
}
