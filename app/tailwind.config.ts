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
        primary: "#9945FF",
        secondary: "#14F195",
        dark: "#0D1117",
        darker: "#010409",
      },
    },
  },
  plugins: [],
} satisfies Config;
