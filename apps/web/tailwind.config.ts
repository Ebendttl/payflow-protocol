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
        white: 'rgb(var(--text-white) / <alpha-value>)',
        primary: {
          DEFAULT: '#0D9488', // Teal
          dark: '#0F766E',
          light: '#2DD4BF',
        },
        dark: {
          900: 'rgb(var(--bg-dark-900) / <alpha-value>)',
          800: 'rgb(var(--bg-dark-800) / <alpha-value>)',
          700: 'rgb(var(--bg-dark-700) / <alpha-value>)',
          600: 'rgb(var(--bg-dark-600) / <alpha-value>)',
          500: 'rgb(var(--bg-dark-500) / <alpha-value>)',
          400: 'rgb(var(--bg-dark-400) / <alpha-value>)',
          300: 'rgb(var(--bg-dark-300) / <alpha-value>)',
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
