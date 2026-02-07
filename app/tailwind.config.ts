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
        cream: "#F5F0E8",
        "cream-warm": "#FEFDFB",
        "card-white": "#FFFFFF",
        "accent-red": "#C41E3A",
        "accent-gold": "#DAA520",
        "border-dark": "#2A2A2A",
        "border-light": "#E0DBD2",
        "text-primary": "#1A1A1A",
        "text-secondary": "#666666",
        // Keep carnival namespace for compatibility
        carnival: {
          red: "#C41E3A",
          crimson: "#8B0000",
          gold: "#DAA520",
          cream: "#F5F0E8",
          amber: "#DAA520",
          orange: "#C41E3A",
          dark: "#FEFDFB",
          darker: "#F5F0E8",
          surface: "#FFFFFF",
          border: "#E0DBD2",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        ticket: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'ticket-enter': 'ticketEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ticketEnter: {
          '0%': { transform: 'scale(0.85) rotate(-3deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
