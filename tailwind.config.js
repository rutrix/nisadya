/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    light: 'var(--primary-light)',
                    dark: 'var(--primary-dark)',
                    foreground: 'var(--primary-foreground)',
                    // Filled buttons with white text: 5.18:1 on white, where the
                    // brand orange is 2.82:1 (under the 4.5:1 WCAG minimum).
                    solid: '#C2410C',
                    'solid-dark': '#9A3412',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    light: 'var(--secondary-light)',
                    dark: 'var(--secondary-dark)',
                    foreground: 'var(--secondary-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    light: 'var(--accent-light)',
                    dark: 'var(--accent-dark)',
                    foreground: 'var(--accent-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                cream: 'var(--cream)',
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                // 'pulse' is a Tailwind built-in keyframe; no custom keyframes needed.
            },
        },
    },
    plugins: [],
}
