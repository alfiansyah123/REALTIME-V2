/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#f97316",
        "primary-hover": "#ea580c",
        "background-light": "#fcfcfc",
        "background-dark": "#0d1321",
        "surface-light": "#ffffff",
        "surface-dark": "#171e2e",
        "border-light": "#e5e7eb",
        "border-dark": "#374151",
        "text-main-light": "#111827",
        "text-main-dark": "#f3f4f6",
        "text-muted-light": "#6b7280",
        "text-muted-dark": "#9ca3af",
        "body": "#fcfcfc",
        "dark": "#0d1321",
        "light-dark": "#171e2e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
        body: ["Fira Code", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0px 2px 6px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'slide-in-row': 'slideInRow 0.4s ease-out forwards',
        'highlight-row': 'highlightRow 2s ease-in-out forwards',
      },
      keyframes: {
        slideInRow: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        highlightRow: {
          "0%": { backgroundColor: "rgba(34, 197, 94, 0.2)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [],
}

