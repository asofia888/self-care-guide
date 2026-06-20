/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Elegant serif for display/headings (Latin + Japanese Mincho)
        display: ['"Cormorant Garamond"', '"Shippori Mincho"', 'serif'],
        // Clean, airy sans for body/UI (Latin + Japanese)
        sans: ['"Jost"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        serif: ['"Shippori Mincho"', '"Cormorant Garamond"', 'serif'],
      },
      colors: {
        // Warm ivory / pearl base
        cream: {
          50: '#FCFBF8',
          100: '#F8F5EF',
          200: '#F1ECE2',
          300: '#E6DCCC',
        },
        // Champagne gold — the luxury accent
        champagne: {
          50: '#F8F2E9',
          100: '#EFE3D0',
          200: '#E2CDAC',
          300: '#D2B487',
          400: '#C19C68',
          500: '#B08552',
          600: '#977044',
          700: '#7C5C39',
        },
        // Muted sage — soft botanical secondary
        sage: {
          50: '#F1F3EE',
          100: '#E1E6DB',
          200: '#C8D1BE',
          300: '#AEBBA1',
          400: '#94A485',
          500: '#7C8E6D',
          600: '#647257',
        },
      },
      boxShadow: {
        soft: '0 2px 20px -8px rgba(124, 92, 57, 0.12)',
        elegant: '0 18px 50px -24px rgba(124, 92, 57, 0.22)',
        glow: '0 0 60px -10px rgba(193, 156, 104, 0.35)',
      },
      letterSpacing: {
        luxe: '0.28em',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.55' },
          '50%': { transform: 'scale(1.14)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.45)', opacity: '0.5' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'shimmer-slide': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        breathe: 'breathe 3.6s ease-in-out infinite',
        ripple: 'ripple 3s ease-out infinite',
        'spin-slow': 'spin 9s linear infinite',
        'spin-reverse-slow': 'spin 7s linear infinite reverse',
        shimmer: 'shimmer-slide 2.6s ease-in-out infinite',
        drift: 'drift 4.5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
