/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        name: ["'Space Grotesk'", "Arial", "sans-serif"],
      },
      colors: {
        cream: "#E8D5B7",
        "cream-dark": "#C4A882",
      },
    },
  },
  plugins: [],
};
