import colors from "tailwindcss/colors";

// "emerald" est la seule famille de couleur qui change de sens selon le
// contexte (vert en bibliothèque Standard, ardoise en bibliothèque
// Expert) -- elle pointe donc vers des variables CSS (définies dans
// src/theme.css), pas des couleurs figées. Ainsi, TOUTE classe
// emerald-XXX utilisée n'importe où dans l'app -- même une nouvelle,
// jamais listée nulle part -- bascule automatiquement de couleur sous
// .theme-expert, sans liste à maintenir à la main.
const emeraldVar = (shade) => `rgb(var(--emerald-${shade}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: emeraldVar(50), 100: emeraldVar(100), 200: emeraldVar(200), 300: emeraldVar(300),
          400: emeraldVar(400), 500: emeraldVar(500), 600: emeraldVar(600), 700: emeraldVar(700),
          800: emeraldVar(800), 900: emeraldVar(900), 950: emeraldVar(950),
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
          50: "#f0f4f8",
          100: "#dbe6f0",
          200: "#b7cbe0",
          300: "#7fa0c4",
          400: "#2c5282",
          500: "#264b74",
          600: "#204064",
          700: "#1c3a5a",
          800: "#1a365d",
          900: "#142842",
          950: "#0b1a2c",
        },
      },
    },
  },
  plugins: [],
};
