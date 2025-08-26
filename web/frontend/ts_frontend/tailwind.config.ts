import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E67923',
        dark: '#3B2E27',
        'dark-text': '#3C3C3C'
      }
    }
  },
  plugins: []
} satisfies Config;
