'use client';

/** The root layout itself failed. This page replaces the whole document, so it has no header, footer, theme or
 * site CSS. It imports no stylesheet on purpose: a shared import makes the build split the site CSS into more files. */
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '20vh 20px' }}>
        <title>Nisadya</title>
        <h1 style={{ fontSize: 24 }}>The site could not load</h1>
        <p>Try again in a moment.</p>
        <button type="button" onClick={() => retry()} style={{ marginTop: 24, padding: '16px 40px', fontSize: 16, fontWeight: 700, background: '#000', color: '#fff', border: 0, cursor: 'pointer' }}>
          Try again
        </button>
      </body>
    </html>
  );
}
