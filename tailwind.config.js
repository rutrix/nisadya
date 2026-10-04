/** @type {import('tailwindcss').Config} */
const v = (name) => `var(--${name})`;
// The card colours a1 to a4 read slots. globals.css fills the slots in order. The layout script shuffles them for each visit.
const slot = (n) => ({ base: v(`slot${n}-base`), tint: v(`slot${n}-tint`), tag: v(`slot${n}-tag`), text: v(`slot${n}-text`) });

module.exports = {
  content: ['./src/**/*.{ts,tsx,mjs}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1080px', xl: '1560px' },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#fff',
      black: '#000',
      bg: v('bg'),
      surface: { subtle: v('surface-subtle'), faint: v('surface-faint'), dark: v('surface-dark') },
      fg: {
        DEFAULT: v('fg'),
        subtle: v('fg-subtle'),
        secondary: v('fg-secondary'),
        legal: v('fg-legal'),
        muted: v('fg-muted'),
        'on-dark': v('fg-on-dark'),
      },
      line: { DEFAULT: v('border'), subtle: v('border-subtle'), 'on-dark': v('border-on-dark') },
      brand: { DEFAULT: v('brand'), strong: v('brand-strong'), fg: v('brand-fg') },
      focus: v('focus'),
      danger: v('danger'),
      venue: { bg: v('venue-bg'), panel: v('venue-panel') },
      'faq-answer': v('faq-answer'),
      share: { DEFAULT: '#444', hover: '#666' },
      a1: slot(1),
      a2: slot(2),
      a3: slot(3),
      a4: slot(4),
    },
    fontFamily: {
      sans: ['"Pretendard Variable"', 'Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      display: v('font-display'),
    },
    extend: {
      maxWidth: { page: '1280px', wide: '1492px', board: '1645px', detail: '800px', doc: '675px' },
      transitionTimingFunction: { out: 'cubic-bezier(.16,1,.3,1)' },
      transitionDuration: { fast: '120ms', base: '200ms' },
      boxShadow: { 'inset-soft': 'inset 0 0 20px 0 rgba(0,0,0,0.2)', toast: '0 0 8px rgba(0,0,0,0.08)' },
    },
  },
  plugins: [],
};
