/** @type {import('tailwindcss').Config} */
// Warna memakai CSS variable di src/index.css, jadi berubah otomatis mengikuti tema.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: v('base'),
        secondary: v('secondary'),
        card: v('card'),
        border: 'var(--border)',
        lime: v('lime'),
        limeBright: v('lime-bright'),
        text: v('text'),
        muted: v('muted'),
        dim: v('dim'),
        faint: v('faint'),
        panel: v('panel'),
        chip: v('chip'),
        bar: v('bar'),
        mix2: v('mix-2'),
        mix3: v('mix-3'),
        hairline: 'var(--hairline)',
        line: 'var(--line)',
        lineStrong: 'var(--line-strong)',
        // Tetap gelap di kedua tema, karena dipakai sebagai teks di atas lime.
        ink: '#0A0C06',
        pending: v('pending'),
        danger: v('danger'),
      },
      // Nilai teks dari layer figcraft gopa-gym.figcraft (landing desktop).
      fontSize: {
        hero: ['76px', { lineHeight: '68px', letterSpacing: '-0.5px' }],
        'section-xl': ['76px', { lineHeight: '74px', letterSpacing: '-0.5px' }],
        'section-lg': ['56px', { lineHeight: '58px', letterSpacing: '-0.3px' }],
        'cta-title': ['50px', { lineHeight: '52px', letterSpacing: '-0.3px' }],
        'stat-hero': ['46px', { lineHeight: '46px' }],
        'stat-lg': ['72px', { lineHeight: '72px' }],
        'stat-md': ['34px', { lineHeight: '34px' }],
        'pillar-title': ['22px', { lineHeight: '24px' }],
        'pkg-title': ['26px', { lineHeight: '1.1', letterSpacing: '0.4px' }],
        price: ['42px', { lineHeight: '42px' }],
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
