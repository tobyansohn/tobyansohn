/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Satoshi'", "system-ui", "sans-serif"],
        name: ["'Fraunces'", "Georgia", "serif"],
      },
      colors: {
        // Honey/amber accent (dark mode) — golden-hour tone
        honey: "#E8B257",
        "honey-dark": "#C9913B",
        // Forest accent (light mode) — pairs with the dark-mode base
        forest: "#2D4A2B",
        "forest-dark": "#1F3320",
      },
      animation: {
        marquee: "marquee 45s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
