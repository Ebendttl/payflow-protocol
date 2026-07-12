import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#0D9488', // Teal
          dark: '#0F766E',
          light: '#2DD4BF',
        },
        dark: {
          900: 'var(--bg-dark-900)',
          800: 'var(--bg-dark-800)',
          700: 'var(--bg-dark-700)',
          600: 'var(--bg-dark-600)',
          500: 'var(--bg-dark-500)',
          400: 'var(--bg-dark-400)',
          300: 'var(--bg-dark-300)',
        },
        accent: {
          DEFAULT: '#8B5CF6', // Violet
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
          purple: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
