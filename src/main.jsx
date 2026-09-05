import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initErrorTracking, ErrorBoundary } from "./lib/errorTracking.js";

// Quand une mise à jour est déployée pendant qu'un onglet reste ouvert,
// un fichier chargé à la demande (export PDF, graphiques...) peut
// pointer vers une version qui n'existe plus sur le serveur. Plutôt que
// de planter, on recharge une seule fois la page pour récupérer la
// version à jour -- sans boucle infinie si le souci persiste vraiment.
const RELOAD_KEY = "apezeo-reload-apres-echec-import";
window.addEventListener("vite:preloadError", () => {
  if (!sessionStorage.getItem(RELOAD_KEY)) {
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  }
});
window.addEventListener("unhandledrejection", (event) => {
  const msg = event?.reason?.message || "";
  if (/Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(msg)) {
    if (!sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    }
  }
});

initErrorTracking();

function CrashFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 360, textAlign: "center" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: "#022c22", marginBottom: 8 }}>Une erreur est survenue</h1>
        <p style={{ fontSize: 14, color: "#57534e", marginBottom: 16 }}>Nous avons été informés du problème. Essayez de recharger la page.</p>
        <button onClick={() => window.location.reload()} style={{ fontSize: 14, color: "#047857", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Recharger</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<CrashFallback />}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
