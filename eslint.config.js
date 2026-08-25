import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

// Configuration volontairement centrée sur les vraies erreurs (variable
// non définie, import manquant, hook mal utilisé) plutôt que sur des
// questions de style — c'est exactement le genre de bug qu'on a eu
// avec l'icône Heart oubliée à l'import, invisible au build.
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // pas nécessaire avec le JSX automatique de Vite
      "react/prop-types": "off", // pas de PropTypes dans ce projet, non bloquant
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/no-unescaped-entities": "off", // beaucoup de texte français avec apostrophes
      // Signale le schéma classique "charger les données au montage
      // d'un écran" comme une erreur — utilisé partout ici à dessein,
      // pas un bug. Réduit à un avertissement plutôt que bloquant.
      "react-hooks/set-state-in-effect": "warn",
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["**/*.test.jsx", "src/test/**"],
    languageOptions: { globals: { ...globals.node } },
  },
];
