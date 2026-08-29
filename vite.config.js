import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Sépare les bibliothèques externes du code de l'app : elles
        // changent rarement, donc le navigateur peut les garder en
        // cache même quand on met à jour App.jsx. jsPDF n'est pas ici
        // exprès — il est chargé à la demande (voir admin.jsx), pas
        // au démarrage.
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-icons": ["lucide-react"],
          "vendor-sentry": ["@sentry/react"],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Apézeo — Version Pro",
        short_name: "Apézeo",
        description: "Bibliothèque d'aides non médicamenteuses pour les professionnels accompagnant des personnes atteintes d'Alzheimer et maladies apparentées.",
        theme_color: "#065f46",
        background_color: "#F4F6F2",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "fr",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/rest/v1/interventions"),
            handler: "NetworkFirst",
            options: {
              cacheName: "apezeo-fiches-cache",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "apezeo-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
