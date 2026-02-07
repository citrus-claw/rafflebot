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
        cream: "#FBF7EB",
        "accent-red": "#C41E3A",
        "accent-gold": "#B8860B",
        "border-dark": "#393939",
        "border-light": "#D4D0C8",
        "text-primary": "#141414",
        "text-secondary": "#8B8B6E",
        muted: "#8B8B6E",
        // Keep carnival namespace for compatibility
        carnival: {
          red: "#C41E3A",
          crimson: "#8B0000",
          gold: "#B8860B",
          cream: "#FBF7EB",
          amber: "#B8860B",
          orange: "#C41E3A",
          dark: "#FBF7EB",
          darker: "#FBF7EB",
          surface: "#FBF7EB",
          border: "#393939",
        },
      },
      fontFamily: {
        display: ['"IBM Plex Mono"', 'monospace'],
        ticket: ['"IBM Plex Mono"', 'monospace'],
        body: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
