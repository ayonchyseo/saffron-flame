import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "3rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        /* Brand palette — matte obsidian → deep gold, with ember + wine accents */
        obsidian: {
          DEFAULT: "#0a0908",
          900: "#0a0908",
          800: "#121110",
          700: "#1a1817",
          600: "#22201e",
        },
        ink: "#0a0908",
        char: "#1a1817",
        soot: "#22201e",
        gold: {
          DEFAULT: "#c89b3c",
          50: "#fbf3df",
          100: "#f3e0a8",
          200: "#e8c879",
          300: "#dcae54",
          400: "#c89b3c",
          500: "#a07a26",
          600: "#7a5c1b",
        },
        ember: {
          DEFAULT: "#ff5b1f",
          glow: "#ff7a3d",
          deep: "#b8330e",
        },
        bone: "#f5efe4",
        wine: "#3a0a0e",
        sang: "#5c1f1a",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "fluid-sm": ["clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)", { lineHeight: "1.05" }],
        "fluid-md": ["clamp(2.5rem, 1.6rem + 4vw, 4.5rem)", { lineHeight: "1.02" }],
        "fluid-lg": ["clamp(3rem, 2rem + 5vw, 6.5rem)", { lineHeight: "0.98" }],
        "fluid-xl": ["clamp(3.75rem, 2.4rem + 7vw, 9rem)", { lineHeight: "0.94" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        widest2: "0.32em",
        widest3: "0.45em",
      },
      boxShadow: {
        "gold-glow": "0 0 0 1px rgba(200,155,60,0.5), 0 8px 30px -8px rgba(200,155,60,0.45)",
        "ember-glow": "0 0 40px -6px rgba(255,91,31,0.4)",
        "cinema": "0 30px 80px -20px rgba(0,0,0,0.6), 0 12px 24px -8px rgba(200,155,60,0.18)",
        "inset-gold": "inset 0 1px 0 0 rgba(200,155,60,0.2)",
      },
      backgroundImage: {
        noise:
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.78  0 0 0 0 0.61  0 0 0 0 0.24  0 0 0 0.15 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        "ember-radial":
          "radial-gradient(60% 50% at 50% 100%, rgba(255,91,31,0.35) 0%, rgba(255,91,31,0.08) 40%, transparent 75%)",
        "gold-mesh":
          "radial-gradient(40% 30% at 30% 20%, rgba(200,155,60,0.18), transparent 60%), radial-gradient(35% 25% at 80% 80%, rgba(255,91,31,0.12), transparent 60%)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(200,155,60,0.5) 20%, rgba(200,155,60,0.5) 80%, transparent)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "45%": { opacity: "0.86", filter: "brightness(1.15)" },
          "55%": { opacity: "0.92", filter: "brightness(0.95)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "scroll-hint": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translateY(14px)", opacity: "0" },
        },
        "ember-rise": {
          "0%": { transform: "translateY(0) translateX(0) scale(1)", opacity: "0" },
          "20%": { opacity: "0.85" },
          "100%": {
            transform: "translateY(-120vh) translateX(var(--drift, 12px)) scale(0.4)",
            opacity: "0",
          },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 4.5s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "scroll-hint": "scroll-hint 1.6s ease-in-out infinite",
        "ember-rise": "ember-rise var(--dur, 8s) linear infinite",
        "fade-up": "fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
