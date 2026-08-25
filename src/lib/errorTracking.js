import * as Sentry from "@sentry/react";

// N'active rien si la clé n'est pas configurée — le développement
// local et un déploiement sans compte Sentry continuent de fonctionner
// normalement, juste sans remontée d'erreurs.
const dsn = import.meta.env.VITE_SENTRY_DSN;

export function initErrorTracking() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // "production" en ligne, "development" en local
    // Échantillonnage des traces de performance à 10% — largement
    // suffisant pour repérer des lenteurs sans consommer le quota
    // gratuit inutilement.
    tracesSampleRate: 0.1,
  });
}

export const ErrorBoundary = Sentry.ErrorBoundary;
