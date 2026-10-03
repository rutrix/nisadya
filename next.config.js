/** @type {import('next').NextConfig} */

// Firebase App Hosting runs the Next server, so these are served in production.
// The CSP is Report-Only on purpose: it blocks nothing yet, it only reports.
// 'unsafe-inline' for script-src is required by the RSC flight payload and the
// next-themes anti-flash script; do NOT switch to a nonce until Next is bumped
// (GHSA-ffhc-5mcf-pf4q is only reachable once nonces are in use).
// Strict-Transport-Security deliberately omits includeSubDomains and preload
// until someone confirms no plain-HTTP subdomain of nisadya.in exists.
const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    {
        key: 'Content-Security-Policy-Report-Only',
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            // lh3 is listed in case Firebase App Hosting bypasses the image
            // optimiser (see images.unoptimized below). With it off, Next renders
            // the Drive original as the <img src> instead of /_next/image.
            "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://lh3.googleusercontent.com",
            "font-src 'self'",
            // The browser makes no cross-origin request: the sheet is fetched
            // server-side only, in src/lib/server-data.ts (commit 0cf8c4f).
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
        // Firebase App Hosting turns the built-in Next image optimiser OFF
        // unless unoptimized is EXPLICITLY false, which is why nisadya.in
        // 404s on /_next/image and serves 13 full-size Drive originals.
        // https://firebase.google.com/docs/app-hosting/optimize-image-loading
        // (fetched 2026-09-02). Locally this changes nothing: the local build
        // already optimises. minimumCacheTTL is 60s by default, which re-fetches
        // every Drive original far too often for images that change once a year.
        unoptimized: false,
        minimumCacheTTL: 86400,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com',
            },
        ],
    },

    reactStrictMode: true,

    async headers() {
        return [
            { source: '/:path*', headers: securityHeaders },
            // Every image in public/ fetched by name. With the optimiser on that
            // is only the two layout.tsx icons (the rest go through /_next/image
            // and its minimumCacheTTL); if App Hosting bypasses the optimiser
            // the logos are fetched by name too and this covers them. A day,
            // not a year: these names are not content-hashed. Next applies every
            // matching entry, so /:path* still adds the security headers here.
            { source: '/:file(.*\\.png|.*\\.jpg)', headers: cacheOneDay },
        ];
    },
}

module.exports = nextConfig
