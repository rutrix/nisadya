/** @type {import('next').NextConfig} */

// Firebase App Hosting runs the Next server, so the server sends these headers in production.
// The browser enforces this CSP (it is not report-only). It has no report endpoint, so a violation shows
// only in the browser console. The RSC flight payload and the next-themes anti-flash script need
// 'unsafe-inline' for script-src. next dev also needs 'unsafe-eval'. Production never gets it.
// Strict-Transport-Security deliberately omits includeSubDomains and preload
// until someone confirms no plain-HTTP subdomain of nisadya.in exists.
const securityHeaders = [
    // Only the staging backend has NOINDEX=1. A person sets it in the console (App Hosting > Settings >
    // Environment). Search engines then do not list the staging site. Never set it in apphosting.yaml.
    ...(process.env.NOINDEX === '1' ? [{ key: 'X-Robots-Tag', value: 'noindex' }] : []),
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
            "style-src 'self' 'unsafe-inline'",
            // No lh3 host: image() in src/lib/data.ts sends every sheet image through the optimiser (same origin).
            "img-src 'self' data: blob:",
            "font-src 'self'",
            // The browser makes no cross-origin request. Only the server reads the sheet (src/lib/data.ts).
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
        ].join('; '),
    },
];

const cacheOneDay = [{ key: 'Cache-Control', value: 'public, max-age=86400' }];

const nextConfig = {
    poweredByHeader: false,

    images: {
        // Firebase App Hosting disables the built-in Next image optimiser unless unoptimized is explicitly false.
        // https://firebase.google.com/docs/app-hosting/optimize-image-loading (read on 2026-09-02).
        // The default minimumCacheTTL is 4 hours (Next.js 16). One day suits images that change once a year.
        unoptimized: false,
        minimumCacheTTL: 86400,
        // Anyone can call /_next/image, so these limits apply:
        // - It accepts only quality 75. No component uses another quality.
        // - Its disk cache has a size limit, because Cloud Run keeps the disk in memory.
        // - It accepts a Drive image only as lh3 /d/<id> (driveImage in src/lib/core.mjs).
        qualities: [75],
        maximumDiskCacheSize: 50_000_000,
        remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/d/**' }],
    },

    reactStrictMode: true,

    // next dev must not write files into the repo.
    agentRules: false,

    async headers() {
        return [
            { source: '/:path*', headers: securityHeaders },
            // Files in public/ that the browser requests by name: the icons, the share image, the SVG
            // logos, the venue maps and the Pretendard fonts. They get a one-day cache, not one year,
            // because their names are not content hashes. Next applies every entry that matches, so
            // /:path* still adds the security headers here.
            { source: '/:file(.*\\.png|.*\\.jpg|.*\\.svg)', headers: cacheOneDay },
            { source: '/fonts/:path*', headers: cacheOneDay },
            // Baked media (scripts/bake.mjs) have content-hash names, so they get a one-year immutable
            // cache. This entry comes after the rules above, so its Cache-Control wins.
            { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
            // A baked SVG opened on its own must not run scripts on this origin. This entry
            // replaces the site CSP for those files (the header name is the same, and the later entry wins).
            {
                source: '/media/:file(.*\\.svg)',
                headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" }],
            },
        ];
    },
}

module.exports = nextConfig
