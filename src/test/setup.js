import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Simule le client Supabase pour tous les tests : aucune vraie
// requête réseau, chaque appel renvoie une réponse vide "réussie".
// Suffisant pour un test de fumée (est-ce que l'écran s'affiche sans
// planter ?), pas pour vérifier un vrai comportement métier.
vi.mock("../lib/supabase.js", () => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => resolve({ data: [], error: null }),
  };
  return {
    supabase: {
      from: () => chain,
      rpc: () => Promise.resolve({ data: null, error: null }),
      auth: {
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
      },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {},
    },
    supabaseReady: true,
    rowToFiche: (row) => row,
    rowToPersonalFiche: (row) => row,
    ficheToPersonalRow: (f) => f,
  };
});
