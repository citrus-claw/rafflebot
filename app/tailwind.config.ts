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
        muted: '#6b6344',
      },
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Rye"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'stripes-red': 'repeating-linear-gradient(45deg, #D9381E, #D9381E 10px, #C22F17 10px, #C22F17 20px)',
        'stripes-blue': 'repeating-linear-gradient(45deg, #004E7C, #004E7C 10px, #003D61 10px, #003D61 20px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
