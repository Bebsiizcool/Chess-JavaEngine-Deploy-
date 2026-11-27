import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08080a",
        surface: {
          DEFAULT: "#101015",
          card: "#121218",
          border: "#23232e",
          hover: "#1a1a24",
        },
        gold: {
          50: "#fdfbf7",
          100: "#f9f4e8",
          200: "#f2e5c8",
          300: "#e7d09b",
          400: "#dbb76c",
          500: "#d4af37",
          600: "#b88c28",
          700: "#946a1e",
          800: "#79541d",
          900: "#66451c",
        },
        board: {
          light: "#ebe4d8",
          dark: "#4a3e35",
          selected: "#d4af37",
          highlight: "rgba(212, 175, 55, 0.45)",
          prevMove: "rgba(212, 175, 55, 0.3)",
          inCheck: "rgba(239, 68, 68, 0.7)",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        serif: ["'Cinzel'", "serif"],
        decorative: ["'Cinzel Decorative'", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
