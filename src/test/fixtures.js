// Fiches factices, au format exact que produit rowToFiche(), pour les
// tests de fumée. Ne pas utiliser pour vérifier un vrai comportement
// métier — juste "l'écran s'affiche-t-il sans planter avec des
// données plausibles ?".

export const mockFicheTechnique = {
  id: "db-1", dbId: 1, isLocal: false,
  titre: "Proposer une activité rassurante",
  categorie: "Communication", sousCategorie: "",
  description: "Description de test.", pourquoi: "",
  troubles: ["Agitation"], stades: ["Modéré"], contextes: [],
  dureeLabel: "", dureeMinutes: 10, materiel: [],
  etapes: [], conseils: [], erreurs: [], contreIndications: [],
  niveauPreuve: 4, difficulte: "Facile", sources: [], motsCles: [],
  dateMaj: "", niveauDetail: "expert", typeFiche: "technique",
  outilType: "", indication: "", contreIndicationOutil: [],
  precautionsParticulieres: [], croquisSvg: "", croquisUrl: "",
  alerteOutil: "", techniqueId: "COM-001", techniquesLiees: [],
  objectifsObservables: ["Observer le calme"], tempsMiseEnOeuvre: "",
  frequence: "", preparation: [],
  deroulement: [{ etape: 1, titre: "Observer", description: "Observer la situation." }],
  adaptationStades: null, conditionsFavorables: [], pointsVigilance: [],
  erreursFrequentes: [], precautions: [], fondementPrincipe: "",
  fondementApplication: "", commentEvaluerEfficacite: [], pointsCles: [],
  version: "",
};

export const mockFicheConcept = {
  ...mockFicheTechnique,
  id: "db-2", dbId: 2, typeFiche: "concept",
  titre: "Comprendre une situation",
};

export const mockFicheOutil = {
  ...mockFicheTechnique,
  id: "db-3", dbId: 3, typeFiche: "outil",
  titre: "Un outil spécifique", outilType: "Luminothérapie",
  indication: "Indication de test.",
};

export const mockFicheStandard = {
  ...mockFicheTechnique,
  id: "db-4", dbId: 4, niveauDetail: "standard",
  pourquoi: "Pourquoi ça marche.", quandUtiliser: "Quand l'utiliser.",
  quandEviter: "", etapes: ["Étape 1", "Étape 2"],
};
