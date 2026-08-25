// Petits utilitaires partagés, sans dépendance à React ni à un écran
// précis — extraits de App.jsx pour réduire ce fichier et éviter la
// duplication accidentelle entre les vues Pro et Aidant.

export const uid = () => `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const linesToArray = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);

export const arrayToLines = (a) => (a || []).join("\n");

// Logique de score partagée par le formulaire "Trouver la meilleure
// technique", Pro comme Aidant. Les deux versions avaient dérivé l'une
// de l'autre avec le temps (la version Aidant n'appliquait plus les
// bonus stade/contexte/matériel/note négative) — unifiées ici pour
// que toute future évolution s'applique aux deux d'un coup.
// `favoris` attend la forme { liked: [...], disliked: [...] }.
export const scoreFiche = (f, q, favoris) => {
  const typeVoulu = q.typeVoulu || "technique";
  if (typeVoulu !== "tous" && f.typeFiche !== typeVoulu && !(typeVoulu === "technique" && f.typeFiche == null)) return null;
  if (q.troubleIds && q.troubleIds.length > 0 && !q.troubleIds.every((t) => f.troubles.includes(t))) return null;
  if (q.besoin && f.categorie !== q.besoin) return null;
  if (q.tempsDispo != null && f.dureeMinutes > 0 && f.dureeMinutes > q.tempsDispo) return null;
  let score = 0;
  score += (q.troubleIds?.length || 0) * 20;
  if (q.besoin) score += 25;
  if (q.stade && f.stades.includes(q.stade)) score += 15;
  if (q.contexte && (f.contextes || []).includes(q.contexte)) score += 10;
  if (q.materielDispo === false && (f.materiel || []).length === 0) score += 10;
  if (q.materielDispo === true) score += 3;
  score += (f.niveauPreuve || 0) * 2;
  if (favoris?.liked?.includes(f.id)) score += 15;
  if (favoris?.disliked?.includes(f.id)) score -= 60;
  return score;
};
