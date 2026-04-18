import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Base dark palette
        space: {
          DEFAULT: "#0a0e14",
          deep: "#060910",
          surface: "#121821",
          elevated: "#1a2231",
          border: "#1f2937",
          "border-hover": "#2d3b4f",
        },
        // Text
        text: {
          primary: "#f3f4f6",
          secondary: "#9ca3af",
          muted: "#6b7280",
          dim: "#4b5563",
        },
        // Lime accent (controlled use)
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
          glow: "rgba(132, 204, 22, 0.25)",
        },
        brand: {
          DEFAULT: "#84cc16",
          dark: "#65a30d",
          light: "#bef264",
          pale: "#ecfccb",
          neon: "#c4e538",
        },
        // Status
        bull: { DEFAULT: "#22c55e", dark: "#16a34a", light: "#86efac" },
        bear: { DEFAULT: "#ef4444", dark: "#dc2626", light: "#fca5a5" },
        warning: { DEFAULT: "#eab308", light: "#fde047" },
        // Legacy ink mapping for existing code
        ink: {
          pure: "#f3f4f6",
          900: "#e5e7eb",
          800: "#d1d5db",
          700: "#9ca3af",
          600: "#6b7280",
          500: "#6b7280",
          400: "#4b5563",
          300: "#374151",
          200: "#1f2937",
          100: "#121821",
        },
        paper: {
          pure: "#0a0e14",
          off: "#121821",
          cream: "#1a2231",
        },
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.025em",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        ticker: "ticker 60s linear infinite",
        orbit: "orbit 24s linear infinite",
        "orbit-reverse": "orbit 18s linear infinite reverse",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out infinite 2s",
        shimmer: "shimmer 2.5s linear infinite",
        "border-glow": "borderGlow 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(132, 204, 22, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(132, 204, 22, 0.35)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(132, 204, 22, 0.2)" },
          "50%": { borderColor: "rgba(132, 204, 22, 0.5)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "lime-glow": "radial-gradient(circle at center, rgba(132, 204, 22, 0.15) 0%, transparent 70%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(132, 204, 22, 0.1) 50%, transparent 100%)",
      },
      boxShadow: {
        "lime-sm": "0 2px 12px rgba(132, 204, 22, 0.12)",
        "lime-md": "0 4px 24px rgba(132, 204, 22, 0.18)",
        "lime-lg": "0 8px 40px rgba(132, 204, 22, 0.25)",
        "inset-dark": "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
