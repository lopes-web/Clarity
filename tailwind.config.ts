import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#D9CBCB",
        input: "#D9CBCB",
        ring: "#4A2828",
        background: "#1A0F0F",
        foreground: "#E7D5D5",
        primary: {
          DEFAULT: "#E2C7C7",
          foreground: "#1A0F0F",
        },
        secondary: {
          DEFAULT: "#D4B4B4",
          foreground: "#1A0F0F",
        },
        destructive: {
          DEFAULT: "#4A2828",
          foreground: "#E7D5D5",
        },
        muted: {
          DEFAULT: "#4A2828",
          foreground: "#E7D5D5",
        },
        accent: {
          DEFAULT: "#E5B7B7",
          foreground: "#1A0F0F",
        },
        popover: {
          DEFAULT: "#1A0F0F",
          foreground: "#E7D5D5",
        },
        card: {
          DEFAULT: "#1A0F0F",
          foreground: "#E7D5D5",
        },
        pastel: {
          pink: "#FFDEE2",
          purple: "#E5DEFF",
          blue: "#D3E4FD",
          peach: "#FDE1D3",
          green: "#F2FCE2",
          yellow: "#FEF7CD",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
} satisfies Config;