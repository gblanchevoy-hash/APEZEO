import colors from "tailwindcss/colors";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Harmonisées sur les couleurs de la landing page (gate-v2.css)
        // pour que le même vert et le même orange soient utilisés dans
        // toute l'application, pas seulement sur la page d'accueil.
        emerald: {
          50: "#eef8f7",
          100: "#d7f0ed",
          200: "#aee1db",
          300: "#7fcec5",
          400: "#4bb3a8",
          500: "#0a7774",
          600: "#096a67",
          700: "#0a5654",
          800: "#0c4442",
          900: "#174143",
          950: "#0a2827",
        },
        amber: {
          50: "#fff3e0",
          100: "#ffe4bd",
          200: "#ffd08f",
          300: "#ffb85c",
          400: "#fda42e",
          500: "#f59719",
          600: "#e08000",
          700: "#c06d08",
          800: "#995708",
          900: "#7a4508",
          950: "#452705",
        },
        sky: {
          50: "#eef4f8",
          100: "#d7e6f0",
          200: "#aecbe0",
          300: "#7fabc9",
          400: "#4d86ab",
          500: "#2c6690",
          600: "#21526f",
          700: "#1d4359",
          800: "#1a3547",
          900: "#16293a",
          950: "#0d1a24",
        },
      },
    },
  },
  plugins: [],
};
