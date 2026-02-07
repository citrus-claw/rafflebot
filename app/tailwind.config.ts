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
        primary: "#E63946",
        secondary: "#FFB703",
        accent: "#FB8500",
        gold: "#FFD700",
        carnival: {
          red: "#E63946",
          crimson: "#9B1D20",
          orange: "#FB8500",
          amber: "#FFB703",
          gold: "#FFD700",
          cream: "#FFF1D0",
          dark: "#0B0E17",
          darker: "#060810",
          surface: "#131829",
          border: "#1E2540",
        },
        dark: "#0B0E17",
        darker: "#060810",
      },
      fontFamily: {
        display: ['"Permanent Marker"', 'cursive'],
        ticket: ['"Alfa Slab One"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ticket-enter': 'ticketEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'confetti': 'confetti 1s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ticketEnter: {
          '0%': { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 183, 3, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 183, 3, 0.6)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'carnival-gradient': 'linear-gradient(135deg, #E63946 0%, #FB8500 50%, #FFB703 100%)',
        'ticket-gradient': 'linear-gradient(135deg, #1a1f35 0%, #131829 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
      },
    },
  },
  plugins: [],
} satisfies Config;
