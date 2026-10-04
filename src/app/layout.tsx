import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { HERO_SETS } from '@/components/home/Hero';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/Toast';
import { PHASE_KEYS, SITE_URL, getSite, shareImage, siteName } from '@/lib/data';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSite();
  const name = siteName(s);
  const share = shareImage(s);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.tagline ? `${name}: ${s.tagline}` : name, template: `%s | ${name}` },
    description: s.description,
    openGraph: { siteName: name, type: 'website', locale: 'en_IN', url: './', images: [{ url: share, width: 1200, height: 630, alt: name }] },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/favicon.png', apple: '/apple-icon.png' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// The script makes two choices for this visit before the first paint. It keeps them in sessionStorage through
// reloads and page changes in the tab. A new tab or visit gets new ones. If the browser blocks storage, the
// choices are new on each load.
// 1. The order of the card colours, for example "3142": slot 1 gets accent 3, and so on.
// 2. The hero image set: data-hero on <html>, 1 to HERO_SETS.length (globals.css shows that set).
// Plain ES5, because it runs before the app.
const SHUFFLE = `(function(){var k='nisadya-accents',o;try{o=sessionStorage.getItem(k)}catch(e){}
if(!o||o.split('').sort().join('')!=='1234'){var a=[1,2,3,4];for(var i=3;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}
o=a.join('');try{sessionStorage.setItem(k,o)}catch(e){}}
var s=document.documentElement.style,p=['base','tint','tag','text'];
for(var n=0;n<4;n++)for(var q=0;q<4;q++)s.setProperty('--slot'+(n+1)+'-'+p[q],'var(--a'+o.charAt(n)+'-'+p[q]+')');
var h='nisadya-hero',N=${HERO_SETS.length},v;try{v=sessionStorage.getItem(h)}catch(e){}
if(!(v>0&&v<=N&&String(v|0)===v)){v=String(1+Math.floor(Math.random()*N));try{sessionStorage.setItem(h,v)}catch(e){}}
document.documentElement.setAttribute('data-hero',v)})()`;

export default async function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const { settings: s } = await getSite();
  const frame = {
    name: siteName(s),
    regUrl: s.registration_url,
    phase: Object.fromEntries(PHASE_KEYS.map((k) => [k, s[k] ?? ''])),
    serverNow: Date.now(),
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Before the first paint: pick the card colour order and the hero image set for this visit. */}
        <script dangerouslySetInnerHTML={{ __html: SHUFFLE }} />
        {/* Pretendard, official dynamic subset (SIL OFL 1.1): the browser downloads only the subsets it needs. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/pretendard/pretendardvariable-dynamic-subset.css" />
      </head>
      <body>
        <Providers>
          <a
            href="#main"
            className="fixed left-1 top-1 z-[100] -translate-y-20 rounded-lg bg-brand px-4 py-2 text-brand-fg transition-transform duration-fast ease-out focus:translate-y-0"
          >
            Skip to content
          </a>
          <div className="flex min-h-svh flex-col">
            <Header {...frame} />
            <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
              {children}
            </main>
          </div>
          <Footer s={s} />
          {modal}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
