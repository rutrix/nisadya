import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const poppins = Poppins({
    // Only weight 800 is ever painted: the single `font-heading` element
    // (Hero.tsx) sits inside a font-extrabold h1. 600 and 700 were preloaded
    // on every page load and never used.
    weight: ["800"],
    subsets: ["latin"],
    variable: "--font-poppins",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL('https://nisadya.in'),
    title: {
        default: "Nisadya'26 | College Fest",
        template: "%s | Nisadya'26",
    },
    description: "Join us for an unforgettable celebration of talent, creativity, and innovation at Nisadya'26 - the annual college fest.",
    keywords: ["college fest", "nisadya", "cultural fest", "technical fest", "2026", "events", "competitions", "NIT Trichy", "DoMS"],
    authors: [{ name: "Nisadya Team" }],
    creator: "DoMS NIT Trichy",
    publisher: "DoMS NIT Trichy",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Nisadya'26 | College Fest",
        description: "Join us for an unforgettable celebration at Nisadya'26",
        url: 'https://nisadya.in',
        siteName: "Nisadya'26",
        images: [
            {
                url: '/fest_main_logo.png', // Ensure this exists or use a dedicated OG image
                width: 800,
                height: 600,
                alt: "Nisadya'26 Logo",
            },
        ],
        locale: 'en_US',
        type: "website",
    },
    twitter: {
        card: 'summary_large_image',
        title: "Nisadya'26 | College Fest",
        description: "Join us for an unforgettable celebration at Nisadya'26",
        images: ['/fest_main_logo.png'], // Ensure this exists
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: "/favicon.png",
        apple: "/apple-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
