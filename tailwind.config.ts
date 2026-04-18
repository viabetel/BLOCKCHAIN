import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        paper: { pure: "#ffffff", off: "#fafaf7", cream: "#f5f1e8" },
        ink: {
          pure: "#0a0a0a", 900: "#171717", 800: "#262626", 700: "#404040",
          600: "#525252", 500: "#737373", 400: "#a3a3a3", 300: "#d4d4d4",
          200: "#e5e5e5", 100: "#f5f5f5",
        },
        brand: {
          DEFAULT: "#84cc16",
          dark: "#65a30d",
          light: "#bef264",
          pale: "#ecfccb",
          neon: "#c4e538",
        },
        lime: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
          accent: "#c4e538",
        },
        bull: { DEFAULT: "#00a868", dark: "#008f59", light: "#e6f7ef" },
        bear: { DEFAULT: "#cf202f", dark: "#a81826", light: "#fbe9eb" },
      },
      letterSpacing: { tightest: "-0.04em", tighter: "-0.025em" },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.3s ease-out both",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        ticker: "ticker 40s linear infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        pulseDot: { "0%, 100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: "0.5", transform: "scale(0.85)" } },
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
    },
  },
  plugins: [],
};
export default config;
