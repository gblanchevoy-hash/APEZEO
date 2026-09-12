// Petits utilitaires partagés, sans dépendance à React ni à un écran
// précis — extraits de App.jsx pour réduire ce fichier et éviter la
// duplication accidentelle entre les vues Pro et Aidant.

export const uid = () => `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

// Certains outils portent une alerte de sécurité/réglementaire
// (alerteOutil non vide -- ex. un vêtement à fermeture dos, proche
// d'une contention physique passive). Règle absolue : ils ne doivent
// jamais remonter parmi les premières propositions. Ce rang se place
// TOUJOURS en tout premier critère de tri, avant la pertinence,
// partout où des fiches sont classées (situations, quiz, troubles...).
export const rangDernierRecours = (f) => (f?.alerteOutil ? 1 : 0);

export const linesToArray = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);

export const arrayToLines = (a) => (a || []).join("\n");

// Supabase plafonne chaque requête à 1000 lignes par défaut, sauf à
// demander explicitement la suite (pagination). Toute requête
// susceptible de dépasser ce nombre (comme `interventions`, qui a
// dépassé 1000 lignes en cours de route) doit passer par ici plutôt
// que par un appel direct .select() — sinon le résultat plafonne
// silencieusement, sans erreur visible.
export async function fetchAllRows(supabase, table, columns = "*", orderCol = "id") {
  const pageSize = 1000;
  let from = 0;
  let all = [];
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderCol, { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) return { data: null, error };
    all = all.concat(data || []);
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return { data: all, error: null };
}

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
  // Moment de la journée : chaque fiche a toujours une valeur renseignée
  // (par défaut "Jour"), donc c'est un vrai filtre, sans risque de vider
  // les résultats.
  if (q.moment && f.momentJournee !== q.moment) return null;
  // Stade et contexte : on n'exclut que si la fiche déclare explicitement
  // une liste ET que la valeur choisie n'y figure pas. Une fiche qui n'a
  // encore aucun stade/contexte renseigné reste incluse -- le tag n'est
  // pas encore assez complet sur l'ensemble de la bibliothèque pour en
  // faire un filtre strict partout.
  if (q.stade && (f.stades || []).length > 0 && !f.stades.includes(q.stade)) return null;
  if (q.contexte && (f.contextes || []).length > 0 && !f.contextes.includes(q.contexte)) return null;
  // Mobilisation limitée (douleur signalée ou non mobilisable) : on
  // écarte complètement l'activité physique plutôt que de la
  // dépriorité -- c'est une question de sécurité, pas de préférence.
  if (q.mobilisationLimitee && f.categorie === "Activité physique") return null;
  // Toucher non accessible : exclusion, comme la mobilisation -- une
  // seule catégorie concernée, pas de risque de vider les résultats.
  if (q.toucherAccessible === false && f.categorie === "Toucher / Massage") return null;
  let score = 0;
  score += (q.troubleIds?.length || 0) * 20;
  if (q.besoin) score += 25;
  if (q.stade && f.stades.includes(q.stade)) score += 15;
  if (q.contexte && (f.contextes || []).includes(q.contexte)) score += 10;
  if (q.moment && f.momentJournee === q.moment) score += 10;
  // Accès au langage verbal réduit ou absent : les approches non
  // verbales prennent le pas sur la communication verbale.
  if (q.langageVerbal === "non" || q.langageVerbal === "difficile") {
    if (["Stimulation sensorielle", "Toucher / Massage", "Validation émotionnelle"].includes(f.categorie)) score += 12;
    if (f.categorie === "Communication") score -= 12;
  }
  // Symptômes dépressifs signalés en plus du motif principal de
  // recherche : les fiches déjà taguées pour ce trouble remontent,
  // même si ce n'est pas le trouble sélectionné en premier lieu.
  if (q.symptomesDepressifs && f.troubles.includes("Symptômes dépressifs")) score += 15;
  // Récurrence du trouble (option 2 : pas de nouveau tag sur les
  // fiches, on repondère seulement les catégories déjà en place).
  if (q.recurrence === "frequent" && ["Routine", "Environnement"].includes(f.categorie)) score += 8;
  if (q.recurrence === "isole" && ["Communication", "Gestion des besoins"].includes(f.categorie)) score += 8;
  if (q.materielDispo === false && (f.materiel || []).length === 0) score += 10;
  if (q.materielDispo === true) score += 3;
  score += (f.niveauPreuve || 0) * 2;
  if (favoris?.liked?.includes(f.id)) score += 15;
  if (favoris?.disliked?.includes(f.id)) score -= 60;
  return score;
};
