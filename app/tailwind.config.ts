import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4E4BC',
        ink: '#1a1a1a',
        'carnival-red': '#D9381E',
        'carnival-blue': '#004E7C',
        gold: '#F2A900',
        surface: '#FFF8E7',
        // Keep old names mapped for wallet adapter CSS etc
        cream: '#F4E4BC',
        'accent-red': '#D9381E',
        'accent-gold': '#F2A900',
        'border-dark': '#1a1a1a',
        'border-light': '#e0d0aa',
        'text-primary': '#1a1a1a',
        'text-secondary': '#6b6344',
        muted: '#6b6344',
        carnival: {
          red: '#D9381E',
          crimson: '#8B0000',
          gold: '#F2A900',
          cream: '#F4E4BC',
          amber: '#F2A900',
          orange: '#D9381E',
          dark: '#1a1a1a',
          darker: '#111',
          surface: '#FFF8E7',
          border: '#1a1a1a',
        },
      },
      fontFamily: {
        display: ['"Rye"', 'serif'],
        ticket: ['"IBM Plex Mono"', 'monospace'],
        body: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'stripes-red': 'repeating-linear-gradient(45deg, #D9381E, #D9381E 10px, #C22F17 10px, #C22F17 20px)',
        'stripes-blue': 'repeating-linear-gradient(45deg, #004E7C, #004E7C 10px, #003D61 10px, #003D61 20px)',
      },
      boxShadow: {
        'chunky': '4px 4px 0px 0px #1a1a1a',
        'chunky-sm': '2px 2px 0px 0px #1a1a1a',
        'chunky-red': '8px 8px 0px 0px rgba(217,56,30,0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
