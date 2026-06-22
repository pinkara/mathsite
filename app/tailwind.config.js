/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "shine": {
          "0%": { transform: "translateX(-100%) rotate(25deg)" },
          "100%": { transform: "translateX(100%) rotate(25deg)" },
        },
        "legendary-shimmer": {
          "0%, 100%": { boxShadow: "0 0 12px 2px rgba(245, 158, 11, 0.35)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(245, 158, 11, 0.6)" },
        },
        "epic-shimmer": {
          "0%, 100%": { boxShadow: "0 0 10px 2px rgba(168, 85, 247, 0.3)" },
          "50%": { boxShadow: "0 0 20px 5px rgba(168, 85, 247, 0.55)" },
        },
        "chest-shake": {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "10%": { transform: "rotate(-5deg) scale(1.05)" },
          "20%": { transform: "rotate(5deg) scale(1.05)" },
          "30%": { transform: "rotate(-5deg) scale(1.05)" },
          "40%": { transform: "rotate(5deg) scale(1.05)" },
          "50%": { transform: "rotate(-3deg) scale(1.05)" },
          "60%": { transform: "rotate(3deg) scale(1.05)" },
          "70%": { transform: "rotate(-2deg) scale(1.05)" },
          "80%": { transform: "rotate(2deg) scale(1.05)" },
          "90%": { transform: "rotate(0deg) scale(1.02)" },
        },
        "chest-burst": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.3)", opacity: "1" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
        "particle-float": {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "1" },
          "100%": { transform: "translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0)", opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.2)" },
        },
        "card-appear": {
          "0%": { transform: "scale(0) rotateY(90deg)", opacity: "0" },
          "60%": { transform: "scale(1.1) rotateY(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotateY(0deg)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "shine": "shine 2.5s ease-in-out infinite",
        "legendary-shimmer": "legendary-shimmer 3s ease-in-out infinite",
        "epic-shimmer": "epic-shimmer 3s ease-in-out infinite",
        "chest-shake": "chest-shake 0.8s ease-in-out",
        "chest-burst": "chest-burst 0.4s ease-out forwards",
        "particle-float": "particle-float 1s ease-out forwards",
        "glow-pulse": "glow-pulse 1.5s ease-in-out infinite",
        "card-appear": "card-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}